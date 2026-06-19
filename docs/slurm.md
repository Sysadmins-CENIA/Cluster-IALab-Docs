# Uso de SLURM

## Introducción

**SLURM** (_Simple Linux Utility for Resource Management_) es el sistema de gestión de recursos y planificación de trabajos (_scheduler_) utilizado en el clúster. Su función principal es administrar las colas de ejecución, asignar recursos de cómputo y coordinar el uso eficiente de los nodos disponibles.

La versión instalada en el clúster es la [26.05.0](https://slurm.schedmd.com/archive/slurm-26.05-latest/).


### Funcionalidades principales

SLURM permite:

- Gestión de colas de trabajos
- Asignación eficiente de recursos
- Ejecución distribuida y paralela
- Monitoreo y control de trabajos
- Control de uso compartido del clúster

---

## Arquitectura de SLURM en el clúster

SLURM utiliza una arquitectura tipo **controller/worker**:

- El nodo controlador ejecuta el servicio `slurmctld`, encargado de administrar la cola y coordinar los recursos.
- Los nodos de cómputo ejecutan el servicio `slurmd`, responsable de ejecutar las tareas asignadas.

En este clúster, el controlador principal se encuentra en: `kraken.ing.puc.cl`.

## Particiones

SLURM organiza los nodos en grupos llamados particiones (partitions).

Cada partición define: recursos disponibles, tiempo máximo de ejecución, límites de memoria, cantidad máxima de tareas, y políticas de acceso y prioridad.

Los usuarios envían trabajos a una partición específica dependiendo de las necesidades computacionales de su tarea.

|Partition|Memoria por CPU<br>(DefMemPerCPU)|Máxima memoria por nodo<br>(MaxMemPerNode)|Máximo de tiempo por tarea<br>(MaxTime)|
|--|--|--|--|
|ialab|4 GB|128 GB|24 hrs|

## Comandos básicos

Existe documentación para cada comando en la página oficial de *SLURM*. Algunos de los comandos básicos para el uso del scheduler se encuentran detallados a continuación.

### Comandos esenciales de SLURM

| Comando | Acción | Documentación |
|---------|--------|---------------|
| `sinfo` | Ver estado general del cluster | [link](https://slurm.schedmd.com/sinfo.html) |
| `squeue` | Ver trabajos en la cola | [link](https://slurm.schedmd.com/squeue.html) |
| `sq` | Versión mejorada de `squeue` | — |
| `sfree` | Ver recursos disponibles | — |
| `scontrol show node <node>` | Ver detalles de un nodo | [link](https://slurm.schedmd.com/scontrol.html) |
| `sbatch script.sh` | Enviar un script batch | [link](https://slurm.schedmd.com/sbatch.html) |
| `srun --pty bash` | Enviar trabajo interactivo | [link](https://slurm.schedmd.com/srun.html) |
| `scancel <jobid>` | Cancelar un trabajo | [link](https://slurm.schedmd.com/scancel.html) |
| `scontrol show job <jobid>` | Ver detalles de un trabajo | [link](https://slurm.schedmd.com/scontrol.html) |
| `serror <jobid>` | Ver errores de un job | — |
| `stail <jobid>` | Ver salida estándar de un job | — |
| `sacct -u $USER` | Ver historial de trabajos | [link](https://slurm.schedmd.com/sacct.html) |



### Ejemplos de uso:
```bash
# Ver particiones disponibles
sinfo
sinfo -s # vista resumida

# Ver jobs en cola
squeue -u $USER        # solo los tuyos
squeue                 # todos

# Versión mejorada de squeue
sq

# Ver recursos disponibles en el cluster (CPU / RAM / GPU disponibles)
sfree

# Ver el estado de un nodo.
scontrol show <node>

# Comandos para interactuar con trabajos en SLURM
# Ejecutar un trabajo SLURM bloqueando tu terminal con 2 tareas o procesos
srun -n 2 python main.py

# Enviar un trabajo SLURM utilizando un script de bash
sbatch script.sh

# Cancelar un trabajo
scancel <jobid>          # por job ID
scancel -u $USER       # todos los tuyos

# Ver o modificar el estado de un trabajo.
scontrol show job <jobid>
sshow <jobid> # Equivalente al comando de arriba

# Pausar y reanudar un trabajo
scontrol hold <jobid>       # detiene la ejecución
scontrol release <jobid>    # la retoma

# Mostrar output de errores del trabajo.
serror <jobid>

# Mostrar output del trabajo.
stail <jobid> 
```

## Ejecutar trabajos en SLURM

### Ejecución interactiva con `srun`

`srun` ejecuta un trabajo de manera **interactiva**, bloqueando tu terminal hasta que termine y mostrando la salida directamente en pantalla. Es útil para pruebas rápidas, depuración o sesiones interactivas. A diferencia de `sbatch` (descrito más abajo), no envía un script a la cola para ejecutarse de forma desatendida.

```bash
# Ejecutar un comando directamente en un nodo de cómputo
srun python main.py

# Solicitar 2 CPUs para la tarea
srun --cpus-per-task=2 python main.py

# Solicitar una GPU
srun --gres=gpu python train.py
```

Para abrir una **shell interactiva** dentro de un nodo de cómputo (por ejemplo, para inspeccionar el entorno o ejecutar comandos manualmente):

```bash
# Abrir una terminal interactiva en un nodo
srun --pty bash

# Terminal interactiva con una GPU asignada
srun --gres=gpu --pty bash
```

`srun` acepta los mismos flags de solicitud de recursos que se describen en la sección [Flags comunes](#flags-comunes) (por ejemplo `--cpus-per-task`, `--mem`, `--gres`, `--nodelist`). Ten en cuenta que la sesión termina y los recursos se liberan al cerrar la terminal o al finalizar el comando.

### Ejecución batch con `sbatch`
Cuando corres un script con `sbatch`, e.g. `sbatch script.sh`, debes indicar los parámetros de la ejecución en el inicio del script. Abajo hay un ejemplo de como se deben indicar las opciones, y en la sección [Ejemplos de SLURM](slurm_examples.md) puedes encontrar scripts de ejemplos útiles para distintas situaciones:

```
#!/bin/bash
#SBATCH --job-name=compile
#SBATCH -t 0-2:00                    # tiempo maximo en el cluster (D-HH:MM)
#SBATCH -o c_job.out                 # STDOUT
#SBATCH -e c_job.err                 # STDERR
#SBATCH --mail-type=END,FAIL         # notificacion cuando el trabajo termine o falle
#SBATCH --mail-user=usuario@uc.cl    # mail donde mandar las notificaciones
#SBATCH --chdir=/user/miusuario      # direccion del directorio de trabajo
#
#SBATCH --nodes 1                    # numero de nodos a usar
#SBATCH --ntasks-per-node=24         # numero de trabajos (procesos) por nodo
#SBATCH --cpus-per-task=1            # numero de cpus (threads) por trabajo (proceso)
#SBATCH --partition=ialab            # partición donde correrá tu trabajo (proceso)

gcc -o a.out main.c
echo "Finished with job $SLURM_JOBID"
```

### Flags comunes

A continuación se muestra una lista de los flags más comunes que un usuario puede incluir en su trabajo, ya sean para solicitar recursos o características para el trabajo.

|Descripción      |Slurm                           |
|-----------------|--------------------------------|
|Nombre del trabajo       |`#SBATCH --job-name=My-Job-Name`  |
|Número de nodos solicitados |`#SBATCH --nodes=1` |
|Número de cores por nodo solicitados |`#SBATCH --ntasks-per-node=24`        |
|Copia las variables de entorno del usuario  |`#SBATCH --export=[ALL\|NONE\|Variables]`  |
|Restricción de tiempo |`#SBATCH --time=24:0:0`   |
|Reiniciar un trabajo en caso de falla|`#SBATCH --requeue`  |
|Compartir los nodos |`#SBATCH --oversubscribe` |
|Reservar los nodos para uso exclusivo|`#SBATCH --exclusive` |
|Uso de un recurso específico |`#SBATCH --constraint="XXX"`|
|Uso de memoria |`#SBATCH --mem=[mem \|M\|G\|T]` o `--mem-per-cpu` |
|Email usuario |`#SBATCH --mail-user=username@uc.cl` |
|Notifica al usuario por evento |`#SBATCH --mail-type=ALL / BEGIN / END or FAIL` |
|Solicitud nodo específico |`#SBATCH --nodelist=hydra` |

#### Uso de GPU

Para solicitar el uso de gpu en tu trabajo se utilizan `--gres=gpu` ó `--gres=gpu:N` donde `N` es el número de gpus por nodo.

**Por ejemplo:**
```bash
#!/bin/bash
#SBATCH -t 0-2:00                               # time (D-HH:MM)
#SBATCH -N 4
#SBATCH --gres=gpu
```

El clúster es **heterogéneo**: distintos nodos tienen distintos modelos de GPU (revisa el [Hardware del Clúster](hardware.md)). Si tu trabajo necesita un modelo concreto, puedes pedirlo con la opción `--gres=gpu:<modelo>:N`:

```bash
#SBATCH --gres=gpu:a40:1        # 1 GPU A40
#SBATCH --gres=gpu:2080ti:2     # 2 GPUs RTX 2080Ti
```

Para ver los modelos (GRES) disponibles en cada nodo usa `sfree` o `sinfo -o "%n %G"` o `scontrol show node <node>`.

### Variables de entorno relevantes en trabajos de SLURM


SLURM define automáticamente variables de entorno que puedes usar dentro de tu script. Las más comunes se listan a continuación; el listado completo está en la [documentación oficial](https://slurm.schedmd.com/sbatch.html#SECTION_OUTPUT-ENVIRONMENT-VARIABLES).

|Nombre              |Variable                     |Descripción                                |
|--------------------|-----------------------------|-------------------------------------------|
|JobID               |`$SLURM_JOBID`               |ID único del trabajo.                      |
|Job Name            |`$SLURM_JOB_NAME`            |Nombre del trabajo.                        |
|Submit Directory    |`$SLURM_SUBMIT_DIR`          |Directorio desde donde se envió.           |
|Submit Host         |`$SLURM_SUBMIT_HOST`         |Nodo desde donde se envió.                 |
|Node List           |`$SLURM_JOB_NODELIST`        |Nodos asignados al trabajo.                |
|Number of Nodes     |`$SLURM_JOB_NUM_NODES`       |Cantidad de nodos asignados.               |
|Number of Tasks     |`$SLURM_NTASKS`              |Cantidad total de tareas.                  |
|CPUs per Task       |`$SLURM_CPUS_PER_TASK`       |CPUs asignadas por tarea.                  |
|Node ID             |`$SLURM_NODEID`              |Índice del nodo dentro del trabajo.        |
|Process ID (rank)   |`$SLURM_PROCID`              |Rank global del proceso (MPI).             |
|Local Task ID       |`$SLURM_LOCALID`             |Índice local de la tarea en el nodo.       |
|GPUs Asignadas      |`$CUDA_VISIBLE_DEVICES`      |GPUs visibles para el trabajo.             |
|Array Job ID        |`$SLURM_ARRAY_JOB_ID`        |ID base de un job array.                   |
|Job Array Index     |`$SLURM_ARRAY_TASK_ID`       |Índice de la tarea en un job array.        |
|Array Task Count    |`$SLURM_ARRAY_TASK_COUNT`    |Número total de tareas del array.          |

Además, el clúster define las siguientes variables propias para acceder a las distintas áreas de almacenamiento:

|Nombre           |Variable                     |Descripción                                |
|-----------------|-----------------------------|-------------------------------------------|
|Home             |`$HOME`                      |Directorio personal del usuario.           |
|Archive Directory|`$ARCHIVE`                   |Almacenamiento de largo plazo.             |
|Scratch Directory|`$SCRATCH`                   |Almacenamiento temporal.                   |
|User Workspace   |`$WORKSPACE`                 |Directorio de trabajo de alto rendimiento. |
