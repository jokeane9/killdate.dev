# venv + Docker — Re-seat Cheat Sheet

> Skim this before going hands-on. Not a tutorial — the "10 commands + 3 ideas" reference to re-seat the mechanics in minutes. (Re-learning is far faster than first learning — the *savings effect*. You're one afternoon from it all snapping back.)
>
> Why it faded: you've been *orchestrating* (directing agents to run this stuff), so the **decisions** stayed sharp and the **keystrokes** went dormant. Normal. This page is just the keystrokes.

---

## The 3 ideas (the mental model — this is what actually matters)

| | What it isolates | Analogy | Cost |
|---|---|---|---|
| **venv** | Python *libraries* for one project | a labeled shelf in **your own kitchen** | free, local |
| **Docker** | the *whole environment* — OS + Python version + libs + code | a **food truck** (brings its own kitchen, runs identically anywhere) | ~an afternoon |
| **Production** | + servers, DB, secrets, monitoring, uptime | the **open restaurant** (real customers depend on it) | real $ + ops |

**Progression:** develop in a **venv** → package with **Docker** for reproducibility → deploy that image to **production**.

Key truth to remember: **Docker ≠ production.** Docker is *reproducibility/packaging* — you run it locally for dev/tests all the time. Production is a *destination* (real users, always-on).

---

## venv — the 6 commands

```bash
python3 -m venv .venv               # create the env (a .venv/ folder)
source .venv/bin/activate           # activate it   (run `deactivate` to exit)
pip install -r requirements.txt     # install pinned deps
pip install <package>               # add a library
pip freeze > requirements.txt       # pin exactly what's installed
.venv/bin/python script.py          # run WITHOUT activating (what we've been doing)
```

- venv isolates **only Python packages** — it uses whatever Python you created it with. It does **not** pin the Python *version* (that's Docker's job).
- `.venv/` is always gitignored. `requirements.txt` is the thing you commit.

---

## Docker — the model + 6 commands

**Two files:**
- `Dockerfile` — the recipe (base image → copy code → install deps → run command).
- `docker-compose.yml` *(optional)* — run several containers together (e.g. app + postgres).

**Image vs container:** image = the built template; container = a running instance of it.

**Minimal Dockerfile for a Python pipeline:**
```dockerfile
FROM python:3.12-slim          # pins the OS *and* Python version (the part venv can't)
WORKDIR /app                   # fixed working dir — kills the relative-path bug class
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run.py"]
```

**The commands:**
```bash
docker build -t myapp .                  # build the image from the Dockerfile
docker run --rm myapp                     # run a one-off container
docker run --rm --env-file .env myapp     # pass secrets/env (NEVER bake keys into the image)
docker run --rm -v "$(pwd)":/app myapp    # mount local code for live dev
docker ps                                 # list running containers
docker exec -it <id> bash                 # shell into a running container
```

- Secrets go in via `--env-file`/`-e` at run time — never `COPY` a `.env` into the image.
- Mount a volume (`-v`) when you want code changes to show up live during dev.

---

## When to reach for each

- **venv** — every Python project, always. Dev + local tests. *(You're here for ai-citations — correct.)*
- **Docker** — when "works on my machine" bites, when you want CI/parity, or right before deploy.
- **Production** — when real users depend on it. Then **Modal / Fly / Render** run your image — or, with serverless (Modal), you often skip hand-managing Docker entirely.

---

## The gotcha that actually bit us (ai-citations CIT-2)

Relative paths break when scripts get moved (`HERE` vs `HERE.parent` — a script's idea of "where I live" stops matching where it's run). **A container fixes this for free** by fixing `WORKDIR /app`. That's a concrete reason Docker earns its place once you want reproducible runs.

---

## Re-seat drill (20 min, gets it fully back)

1. Take any toy `script.py` that prints something.
2. Write the 6-line Dockerfile above (point `CMD` at it).
3. `docker build -t toy .` then `docker run --rm toy`.
4. Add `--env-file .env` and read a key inside the script.

Do that once and the muscle memory is fully reseated.
