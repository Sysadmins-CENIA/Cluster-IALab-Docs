# Roadmap de la documentación

Este documento lista las páginas y temas que se planea incorporar a la
documentación del **Clúster IALab**. Sirve como referencia para priorizar el
trabajo pendiente; no describe funcionalidades ya disponibles.

## Pendientes confirmados

- **ACL para permisos flexibles**
  Guía sobre el uso de _Access Control Lists_ (`setfacl` / `getfacl`) para
  compartir directorios y archivos entre usuarios o grupos con permisos
  granulares, más allá del esquema clásico de propietario/grupo/otros. Útil
  para colaboración en datos y resultados dentro de almacenamiento compartido.

- **CODEX + Claude Code en el clúster**
  Cómo instalar y utilizar asistentes de programación basados en IA (OpenAI
  Codex / CLI y Claude Code) dentro de los nodos del clúster: autenticación,
  configuración en entornos sin navegador, y buenas prácticas al usarlos en
  sesiones interactivas y trabajos de SLURM.

- **UV para entornos de Python**
  Guía de [`uv`](https://github.com/astral-sh/uv) como gestor de entornos y
  dependencias de Python: creación de entornos virtuales, instalación
  reproducible con `uv.lock`, y comparación con `conda`/`venv`/`pip` en el
  contexto del clúster.

- **Identificación de desperdicio de GPU**
  Cómo detectar y diagnosticar uso ineficiente de GPU (baja utilización,
  memoria reservada sin trabajo real, trabajos que dejan GPUs ociosas). Incluye
  herramientas (`nvidia-smi`, métricas de Grafana, `seff`/contabilidad de
  SLURM) y recomendaciones para liberar recursos.

- **Jupyter Notebooks y VS Code remoto vía SLURM**
  Cómo levantar un servidor de Jupyter o conectar VS Code Remote/SSH a un nodo
  de cómputo a través de un trabajo de SLURM, usando _port forwarding_ por SSH.
  Es una de las necesidades más frecuentes para desarrollo y exploración
  interactiva.

- **Entrenamiento distribuido y multi-GPU**
  Guía para escalar entrenamientos a múltiples GPUs y múltiples nodos (por
  ejemplo PyTorch DDP / `torchrun`), incluyendo la solicitud correcta de
  recursos en SLURM y patrones para evitar cuellos de botella.
