# CLAUDE.md

## Project description

Documentation site for the **IALab Cluster** at CENIA (Centro Nacional de Inteligencia Artificial — Chile). Covers the main cluster technical information, onboarding, storage, SLURM usage, SSH access, cluster policies, and FAQs for cluster users.

## Technologies

- **MkDocs** — static site generator (`mkdocs.yml` for configuration)
- **Theme:** `readthedocs`
- **Markdown extension:** `attr_list`
- **Output:** `site/` directory (not committed)

## Path conventions

| Path | Purpose |
|------|---------|
| `docs/` | Markdown source files — one file per documentation page |
| `docs/img/` | Images embedded in documentation pages (PNG, ICO, etc.) |
| `assets/` | Supporting material referenced by the docs but not rendered as pages |
| `assets/samples/` | Example scripts and code organized by technology (SLURM job types, CUDA, OpenMP, etc.) |
| `site/` | MkDocs build output — **not committed** |
| `mkdocs.yml` | Site configuration: navigation, theme, extensions |

## Style guidelines

- All documentation is written in **Spanish**.
- One Markdown file per topic under `docs/`; register each new page in the `nav` section of `mkdocs.yml`.
- Use `#` for the page title (one per file), `##` for sections, `###` for subsections.
- Keep language plain and direct — the audience is researchers and engineers onboarding to an HPC cluster.
- Do not commit the generated `site/` directory.
- Use **snake_case** for all filenames (`slurm_examples.md`, etc.).
