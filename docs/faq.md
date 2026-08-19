# FAQ: Resolución de Problemas y Errores Frecuentes

Esta sección contiene soluciones rápidas a los errores, advertencias e inconvenientes más comunes al utilizar el Clúster IALab. Está dedicada exclusivamente a la resolución de problemas (*troubleshooting*).

---

## Errores de conexión y acceso (SSH)

### Error: `ssh: connect to host kraken.ing.uc.cl port 22: Connection refused` (o la sesión se cierra)

* **Posibles Causas:**
    * Has excedido la cuota de espacio en tu directorio personal (`home`), cuyo límite es de **50 GB**. Cuando no queda espacio libre, el sistema no puede crear los archivos temporales necesarios para validar tu sesión y rechaza el acceso.
    * El nodo `kraken` está temporalmente caído o en mantención.
    * Problemas de red local o VPN de tu lado (revisa si puedes acceder a otros servicios de la red UC).
* **Solución:**
    1. Verifica primero tu conexión a internet y, si corresponde, tu VPN.
    2. Solicita asistencia enviando un correo a [soporte@cenia.cl](mailto:soporte@cenia.cl) para que liberen espacio temporalmente o confirmen el estado del nodo.
    3. Al recuperar el acceso, usa el comando `ncdu` para identificar directorios pesados (cachés, entornos virtuales) y muévelos a tu carpeta `$SCRATCH` o `$ARCHIVE`.

### Error: `Permission denied (publickey)` al intentar conectar

* **Posible Causa:** El cliente SSH local no encuentra tu llave privada o la llave pública no está registrada correctamente en el archivo `~/.ssh/authorized_keys` del clúster.
* **Solución:**
    1. Usa el parámetro `-i` apuntando a tu llave privada, especificando el host completo:
        ```
        ssh -i ~/.ssh/id_ed25519 <usuario>@kraken.ing.puc.cl
        ```
    2. Verifica que la carpeta `.ssh` y el archivo `authorized_keys` tengan los permisos estrictos de Linux:
        ```
        chmod 700 ~/.ssh
        chmod 600 ~/.ssh/authorized_keys
        ```

    !!! note ""
        Para más información puedes revisar la sección [SSH](instructions-and-guides/ssh.md).

### La conexión SSH de VS Code se cae constantemente o no logra conectar

* **Posibles Causas:**
    * VS Code Server intenta instalar extensiones en `~/.vscode-server`; si tu cuota de disco está llena, la instalación falla.
    * Estás ejecutando código pesado directamente en la terminal de VS Code sobre el nodo de entrada Kraken, y el sistema lo detecta y liquida el proceso para proteger el clúster.
* **Solución:**
    1. Verifica tu espacio disponible con `du -sh ~`.
    2. Nunca ejecutes código pesado en Kraken. Configura un *Jump Host* en tu `.ssh/config` para que VS Code se conecte directamente a un nodo de cómputo asignado.

### Ayer me conecté sin problemas, pero hoy mi cuenta está bloqueada (aunque tengo espacio disponible)

* **Posibles Causas:**
    * Tu acceso fue restringido durante los procesos periódicos de limpieza semestral y auditoría del clúster, porque tu cuenta no fue validada a tiempo por tu supervisor.
    * El bloqueo fue intencional, por ejemplo debido a un uso indebido de recursos (procesos fuera de SLURM, saturación de disco compartido) o incumplimiento de alguna política del clúster.
* **Solución:** Envía un ticket a [soporte@cenia.cl](mailto:soporte@cenia.cl) detallando tu usuario y la fecha en que notaste el bloqueo, para que puedan indicarte la causa exacta y el camino de regularización.

---

## Errores y fallas en trabajos (SLURM)

### Cancelación silenciosa: Mi proceso finaliza o desaparece sin dejar logs

* **Posibles Causas:**
    * Estás ejecutando el proceso intensivo directamente en Kraken (headnode), evadiendo SLURM. El clúster monitorea activamente y liquida de forma inmediata cualquier proceso pesado fuera de las colas para proteger los recursos.
    * La ruta donde esperas encontrar los logs no existe o no coincide con la que definiste al lanzar el trabajo.
    * Hay un error en los parámetros con que se invocó `sbatch` o `srun` (por ejemplo, rutas relativas mal resueltas o falta de permisos de escritura en el directorio de salida), lo que impide que el log se genere aunque el proceso sí haya corrido.
* **Solución:** Todo código debe enviarse a los nodos de cómputo usando `sbatch mi_script.sh` o de forma interactiva con `srun --pty bash`. Si ya estás usando SLURM correctamente, verifica que las rutas de `--output` y `--error` en tu script existan y sean escribibles.

### Error: `sbatch: error: Batch job submission failed`

**`Requested partition's memory limit exceeded`**

* **Causa:** Estás pidiendo más de 128 GB de RAM (el límite de la partición `ialab`).
* **Solución:** Reduce el valor de `#SBATCH --mem`.

**`More processors requested than permitted`**

* **Causa:** Si no usas `--mem`, el sistema asigna **4 GB por CPU**. Si pides más de 33 CPUs, superas los 128 GB de RAM permitidos.
* **Solución:** Define explícitamente una memoria menor por CPU, o reduce el número de CPUs solicitadas.

**`Invalid partition name` / `Invalid qos`**

* **Causa:** Estás apuntando a una cola inexistente o no tienes permisos sobre ella.
* **Solución:** Verifica el nombre de la partición con `#SBATCH --partition=ialab`.

### Exit Code 137: Trabajo cancelado inesperadamente (OOM Killer)

* **Causa:** Tu proceso intentó usar más memoria RAM de la asignada. El *Out-Of-Memory (OOM) Killer* del sistema operativo lo detuvo abruptamente para evitar el colapso del nodo.
* **Solución:** Ejecuta `seff <ID_del_job>` para ver el consumo exacto. Vuelve a enviar el trabajo aumentando la RAM solicitada (ej. `#SBATCH --mem=64G`).

### Error: Trabajo cancelado con estado `TIMEOUT`

* **Causa:** El trabajo superó el límite de tiempo continuo de **24 horas** de la partición `ialab`.
* **Solución:** Implementa *checkpoints* (puntos de guardado automáticos) en tu código para reanudar el entrenamiento. Si requieres más tiempo justificado o un proyecto en especifico, envía el [Formulario F-SRCIA-001](https://forms.gle/KtJqrreRoseXYrtU6) con 24h de anticipación.

### Mi trabajo sigue en estado `PENDING` (PD). ¿Por qué no inicia?

* **Posibles Causas:** Revisa la columna `NODELIST(REASON)` usando `squeue`.
    * **`Resources`**: Esperando que se liberen CPUs, GPUs o RAM.
    * **`Priority`**: Hay trabajos con mayor prioridad en cola.
    * **`AssocJobLimit` / `QOSJobLimit`**: Superaste tu límite de trabajos concurrentes.
* **Recomendación:** Usa el comando `sfree` para verificar si efectivamente existen recursos disponibles.

### ¿Cómo depurar un error de segmentación (segfault) sin saturar Kraken?

* **Solución:** Solicita recursos interactivos en un nodo de cómputo para ver el error en tiempo real:

    ```
    srun --pty --mem=16G --cpus-per-task=4 bash
    ```

---

## Almacenamiento, cuotas y permisos (Disco & ACL)

### Error: `No space left on device` o `Disk quota exceeded`

* **Causa:** Has sobrepasado tu cuota (Home: 50 GB, Scratch: 500 GB, Archive: 200 GB, Workspace local: 200 GB).
* **Solución:** Usa `ncdu` para localizar directorios pesados y limpia cachés (e.g. `pip cache purge`, `~/.cache/huggingface`).

### El entrenamiento es extremadamente lento o lanza alertas de I/O

* **Posible Causa:** Estás leyendo tu dataset directamente desde la red (`/home`, `$ARCHIVE` o `$SCRATCH`), saturando la conexión del clúster.
* **Solución:** Copia tus datos primero al disco local de alta velocidad del nodo (`workspace`) y lee/escribe temporalmente allí.

### Error: `Permission denied` en carpetas compartidas con colaboradores

* **Posibles Causas:**
    * Falta de permisos básicos (`+x` para entrar al directorio).
    * Conflictos en las Listas de Control de Acceso (ACL), específicamente en la `mask`.
* **Solución:**
    1. Verifica permisos con `getfacl ruta_directorio`.
    2. Si la `mask` bloquea la escritura (ej. `r-x`), restáurala con `setfacl -m m:rwx ruta_directorio`.

    !!! note ""
        Para más información puedes revisar la sección [Compartir datos usando ACL](instructions-and-guides/acl.md).

### El directorio `home`, `scratch` o `archive` en mi nodo no existe

* **Solución:** Si al ingresar a un nodo de cómputo este inicia en `/` en vez de en tu home, envía un ticket a [soporte@cenia.cl](mailto:soporte@cenia.cl) solicitando su verificación.

### El directorio `workspace` en mi nodo no existe

* **Causa:** El directorio `workspace` se monta vía NFS desde los nodos de cómputo hacia los headnodes, por lo que su ruta cambia según desde dónde lo mires.
* **Solución:** Verifica la ruta correcta según dónde estés parado:

    Dentro de un nodo de cómputo (ej. Ahsoka, en un `srun` interactivo), usa la variable de entorno `$WORKSPACE`, que apunta a:
    ```
    /workspace1/$PI/$USER
    ```

    Desde el headnode (Kraken), esta variable **no existe**; debes usar la ruta completa:
    ```
    /workspaces/ahsoka-workspace1/$PI/$USER
    ```

    Si no encuentras tu subcarpeta en ninguna de las dos rutas, envía un ticket a [soporte@cenia.cl](mailto:soporte@cenia.cl) solicitando su creación.

---

## Hardware, GPUs y compatibilidad (CUDA vs AMD/ROCm)

### Error: "Permission denied" para la GPU o "No HIP GPUs available"

* **Causa:** SLURM aísla el hardware usando políticas estrictas (Cgroups). Si no solicitaste la GPU explícitamente en el script, tu código o contenedor no tendrá permiso para interactuar con ninguna tarjeta gráfica.
* **Solución:** Asegúrate de incluir la directiva `#SBATCH --gres=gpu:N` (ej. `--gres=gpu:a40:1` para un modelo específico).

### Error: `CUDA error: no kernel image is available for execution` en el nodo Antuco

* **Causa:** El nodo **Antuco** utiliza GPUs **AMD (Instinct MI210)**. Las librerías de PyTorch o CUDA compiladas para NVIDIA no son compatibles.
* **Solución:** Debes usar el ecosistema **ROCm**.

### Mi script falla por falta de un paquete o librería de sistema

* **Solución:** No uses `apt` ni solicites instalaciones globales. Encapsula tus dependencias en tu entorno virtual (e.g. `conda` o`venv`) o utiliza un contenedor (solicitando primero la habilitación de contenedores para ti).

### ¿Cómo reporto un nodo caído o un fallo?

* **Solución:** Si un nodo falla o perdiste conexión repentinamente, abre de inmediato un ticket en [soporte@cenia.cl](mailto:soporte@cenia.cl) incluyendo el nombre del nodo, el ID de tu trabajo en SLURM y el registro exacto del error.

---

## Contenedores y Docker

### Error: `docker: command not found` o `Permission denied`

* **Causa:** Por seguridad y aislamiento de privilegios, el servicio nativo de Docker está restringido para los usuarios.
* **Solución:** Si requieres Docker nativo obligatoriamente, solicita autorización a [soporte@cenia.cl](mailto:soporte@cenia.cl).
