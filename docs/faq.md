# FAQ: Resolución de Problemas y Errores Frecuentes

Esta sección contiene soluciones rápidas a los errores, advertencias e inconvenientes más comunes al utilizar el Clúster IALab. Está dedicada exclusivamente a la resolución de problemas (*troubleshooting*).

---

## Errores de conexión y acceso (SSH)

### Error: `ssh: connect to host kraken.dcc.uchile.cl port 22: Connection refused` (o la sesión se cierra)

* **Causa:** Has excedido la cuota de espacio en tu directorio personal (`home`), cuyo límite es de **50 GB**. Cuando no queda espacio libre, el sistema no puede crear los archivos temporales necesarios para validar tu sesión y rechaza el acceso.
* **Solución:**
    1. Solicita asistencia enviando un correo a `soporte@cenia.cl` para que liberen espacio temporalmente.
    2. Al recuperar el acceso, usa el comando `ncdu` para identificar directorios pesados (cachés, entornos virtuales) y muévelos a tu carpeta `$SCRATCH` o `$ARCHIVE`.

### Error: `Permission denied (publickey)` al intentar conectar

* **Causa:** El cliente SSH local no encuentra tu llave privada o la llave pública no está registrada correctamente en el archivo `~/.ssh/authorized_keys` del clúster.
* **Solución:**
    1. Usa el parámetro `-i` apuntando a tu llave privada (ej. `ssh -i ~/.ssh/id_ed25519 tu_usuario@kraken...`).
    2. Verifica que la carpeta `.ssh` y el archivo `authorized_keys` tengan los permisos estrictos de Linux (`chmod 700 ~/.ssh` y `chmod 600 ~/.ssh/authorized_keys`).

### La conexión SSH de VS Code se cae constantemente o no logra conectar

* **Causa:** VS Code Server intenta instalar extensiones en `~/.vscode-server`. Si tu cuota de disco está llena, falla. Además, si ejecutas código interactivo en la terminal de VS Code sobre el nodo de entrada Kraken, el sistema detectará el consumo y liquidará el proceso para proteger el clúster.
* **Solución:** Verifica tu espacio con `du -sh ~`. Nunca corras código pesado en Kraken; configura un *Jump Host* en tu `.ssh/config` para que VS Code se conecte directamente a un nodo de cómputo asignado.

### Ayer me conecté sin problemas, pero hoy mi cuenta está bloqueada (teniendo espacio)

* **Causa:** Tu acceso puede haber sido restringido durante los procesos periódicos de limpieza semestral y auditoría del clúster si tu cuenta no fue validada a tiempo por tu supervisor. Envía un ticket a `soporte@cenia.cl` para regularizar.

---

## Errores y fallas en trabajos (SLURM)

### Cancelación silenciosa: Mi proceso finaliza o desaparece sin dejar logs

* **Causa:** Estás ejecutando el proceso intensivo directamente en Kraken (headnode) evadiendo SLURM. El clúster monitorea activamente y liquida de forma inmediata cualquier proceso pesado fuera de las colas para proteger los recursos.
* **Solución:** Todo código debe enviarse a los nodos de cómputo usando `sbatch mi_script.sh` o de forma interactiva con `srun --pty bash`.

### Error: `sbatch: error: Batch job submission failed`

* **Causas y soluciones:**
  * **`Requested partition's memory limit exceeded`**: Estás pidiendo más de 128 GB de RAM (el límite de la partición `ialab`). Reduce `#SBATCH --mem`.
  * **`More processors requested than permitted`**: Si no usas `--mem`, el sistema asigna **4 GB por CPU**. Si pides más de 33 CPUs, superas los 128 GB de RAM permitidos. Define explícitamente una memoria menor por CPU.
  * **`Invalid partition name` / `Invalid qos`**: Estás apuntando a una cola inexistente o no tienes permisos. Verifica `#SBATCH --partition=ialab`.

### Exit Code 137: Trabajo cancelado inesperadamente (OOM Killer)

* **Causa:** Tu proceso intentó usar más memoria RAM de la asignada. El *Out-Of-Memory (OOM) Killer* del sistema operativo lo detuvo abruptamente para evitar el colapso del nodo.
* **Solución:** Ejecuta `seff <ID_del_job>` para ver el consumo exacto. Vuelve a enviar el trabajo aumentando la RAM solicitada (ej. `#SBATCH --mem=64G`).

### Error: Trabajo cancelado con estado `TIMEOUT`

* **Causa:** El trabajo superó el límite de tiempo continuo de **24 horas** de la partición `ialab`.
* **Solución:** Implementa *checkpoints* (puntos de guardado automáticos) en tu código para reanudar el entrenamiento. Si requieres más tiempo justificado, envía el [Formulario F-SRCIA-001] con 24h de anticipación.

### Mi trabajo sigue en estado `PENDING` (PD). ¿Por qué no inicia?

* **Solución:** Revisa la columna `NODELIST(REASON)` usando `squeue`.
  * **`Resources`**: Esperando que se liberen CPUs, GPUs o RAM.
  * **`Priority`**: Hay trabajos con mayor prioridad en cola.
  * **`AssocJobLimit` / `QOSJobLimit`**: Superaste tu límite de trabajos concurrentes.

### ¿Cómo depurar un error de segmentación (segfault) sin saturar Kraken?

* **Solución:** Solicita recursos interactivos en un nodo de cómputo para ver el error en tiempo real:

    ```bash
    srun --pty --mem=16G --cpus-per-task=4 bash
    ```

---

## Almacenamiento, cuotas y permisos (Disco & ACL)

### Error: `No space left on device` o `Disk quota exceeded`

* **Causa:** Has sobrepasado tu cuota (Home: 50 GB, Scratch: 500 GB, Archive: 200 GB, Workspace local: 200 GB).
* **Solución:** Usa `ncdu` para localizar directorios pesados y limpia cachés (`pip cache purge`, `~/.cache/huggingface`).

### El entrenamiento es extremadamente lento o lanza alertas de I/O

* **Causa:** Estás leyendo tu dataset directamente desde la red (`/home` o `$ARCHIVE`), saturando la conexión del clúster.
* **Solución:** Copia tus datos primero al disco local de alta velocidad del nodo (`Workspace`) y lee/escribe temporalmente allí.

### Error: `Permission denied` en carpetas compartidas con colaboradores

* **Causa:** Falta de permisos básicos (`+x` para entrar al directorio) o conflictos en las Listas de Control de Acceso (ACL).
* **Solución:**
    1. Verifica permisos con `getfacl ruta_directorio`.
    2. Si la `mask` bloquea la escritura (ej. `r-x`), restáurala con `setfacl -m m:rwx ruta_directorio`.

### El directorio `home, scratch o archive` en mi nodo no existe

* **Solución:** Si al ingresar a un nodo de computo este inicia en `/` en vez de en tu home, envía un ticket a `soporte@cenia.cl` solicitando su verificación.

### El directorio `workspace` en mi nodo no existe

* **Solución:** Si vas a entrenar y no encuentras tu subcarpeta (ej. `/workspace/ahsoka/tu_usuario`), envía un ticket a `soporte@cenia.cl` solicitando su creación.

---

## Hardware, GPUs y compatibilidad (CUDA vs AMD/ROCm)

### Error: "Permission denied" para la GPU o "No HIP GPUs available"

* **Causa:** SLURM aísla el hardware usando políticas estrictas (Cgroups). Si no solicitaste la GPU explícitamente en el script, tu código o contenedor no tendrá permiso para interactuar con ninguna tarjeta gráfica.
* **Solución:** Asegúrate de incluir la directiva `#SBATCH --gres=gpu:N` (ej. `--gres=gpu:a40:1` para un modelo específico).

### Error: `CUDA error: no kernel image is available for execution` en el nodo Antuco

* **Causa:** El nodo **Antuco** utiliza GPUs **AMD (Instinct MI210)**. Las librerías de PyTorch o CUDA compiladas para NVIDIA no son compatibles.
* **Solución:** Debes usar el ecosistema **ROCm**.

### Mi script falla por falta de un paquete o librería de sistema

* **Solución:** No uses `apt` ni solicites instalaciones globales. Encapsula tus dependencias en tu entorno virtual (`Conda`/`venv`) o utiliza un contenedor.

### ¿Cómo reporto un nodo caído o un fallo?

* **Solución:** Si un nodo falla o perdiste conexión repentinamiente. Abre de inmediato un ticket en `soporte@cenia.cl` incluyendo el nombre del nodo, el ID de tu trabajo en SLURM y el registro exacto del error.

---

## Contenedores y Docker

### Error: `docker: command not found` o `Permission denied`

* **Causa:** Por seguridad y aislamiento de privilegios, el servicio nativo de Docker está restringido para los usuarios.
* **Solución:** Si requieres Docker nativo obligatoriamente, solicita autorización a `soporte@cenia.cl`.