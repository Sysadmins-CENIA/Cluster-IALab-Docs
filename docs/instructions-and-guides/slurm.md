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
| `seff <jobid>` | Ver eficiencia de CPU y memoria de un trabajo terminado | [link](#monitoreo-y-eficiencia-de-tus-trabajos) |
| `sshare` | Ver asignación de FairShare | [link](https://slurm.schedmd.com/sshare.html) |
| `sprio` | Ver prioridad de jobs | [link](https://slurm.schedmd.com/sprio.html) |



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

# Ver cuánta CPU y memoria usó un trabajo terminado, comparado con lo que pidió
seff <jobid>

# Mostrar share del usuario
sshare

# Mostrar share del usuario con mayor detalle
sshare -l

# Mostrar share de todos los usuarios
sshare -a

# Mostrar prioridad de todos los jobs en PENDING
sprio

# Mostrar prioridad de uno o más jobs en PENDING
sprio --jobs=<ID_JOB1>,<ID_JOB2>
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

```bash
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
#SBATCH --partition=ialab-low        # partición donde correrá tu trabajo (proceso)
#SBATCH --account=default-account    # account de Slurm que debes ocupar para tu trabajo (proceso)
#SBATCH --qos=regular                # cola de trabajo que ocupará tu trabajo (puede ser regular o debug)
#SENDJOBREPORT                       # (opcional) reporte de rendimiento por correo al terminar

python main.py
echo "Finished with job $SLURM_JOBID"
```

!!! tip "Pide solo el tiempo que necesitas: Backfill"
    SLURM usa **Backfill**: cuando hay recursos libres mientras otros trabajos esperan,
    deja pasar adelante a trabajos más cortos que alcancen a terminar sin retrasar
    a los de mayor prioridad.

    **Mientras menos tiempo pida tu trabajo (`--time` / `-t`), más probable es que entre antes.**

    Si te gustaría leer mas sobre este tema puedes ingresar a [este link.](https://slurm.schedmd.com/sched_config.html#backfill)

!!! warning "Si se acaba el tiempo, tu trabajo se termina"
    Cuando un trabajo alcanza el tiempo solicitado, SLURM lo **termina automáticamente**,
    aunque no haya finalizado. Estima un tiempo realista y agrega un margen razonable
    (por ejemplo, 10–20%) en vez de pedir el máximo de la partición.

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
|Reporte de rendimiento por correo al terminar |`#SENDJOBREPORT` (sin `#SBATCH` delante) |

#### Uso de GPU

Para solicitar el uso de GPU en tu trabajo se utilizan `--gres=gpu` ó `--gres=gpu:N` donde `N` es el número de GPUs por nodo.

**Por ejemplo:**
```bash
#!/bin/bash
#SBATCH -t 0-2:00                               # time (D-HH:MM)
#SBATCH -N 4
#SBATCH --gres=gpu
```

El clúster es **heterogéneo**: distintos nodos tienen distintos modelos de GPU (revisa el [Hardware del Clúster](../hardware.md)). Si tu trabajo necesita un modelo concreto, puedes pedirlo con la opción `--gres=gpu:<modelo>:N`:

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

---

## Monitoreo y eficiencia de tus trabajos

Pedir solo los recursos que tu trabajo realmente usa tiene dos ventajas: tus trabajos **esperan menos en cola**, porque el [Backfill](#ejecucion-batch-con-sbatch) puede ubicarlos en los huecos libres, y **quedan recursos libres** para el resto de los usuarios. Tienes tres herramientas para saber cuánto usaron tus trabajos:

| Herramienta | Cuándo usarla | Cómo se obtiene |
|-------------|---------------|-----------------|
| `seff` y `sacct` | Para revisar un trabajo puntual | Los ejecutas tú, en cualquier momento |
| Reporte por trabajo | Para recibir un resumen por correo al terminar un trabajo | Agregando `#SENDJOBREPORT` a tu script |
| Reporte mensual | Para ver cómo usaste el clúster durante el mes | Llega automáticamente el día 1 de cada mes |

### Revisar un trabajo con `seff` y `sacct`

`seff` muestra cuánto usó un trabajo terminado, comparado con lo que pidió:

```bash
seff <jobid>
```

```text
Job ID: 30986
State: COMPLETED (exit code 0)
Cores per node: 4
CPU Utilized: 00:03:58
CPU Efficiency: 24.79% of 00:16:00 core-walltime
Job Wall-clock time: 00:04:00
Memory Utilized: 1.20 GB
Memory Efficiency: 15.00% of 8.00 GB
```

En este ejemplo, el trabajo pidió 4 cores y 8 GB, pero usó en la práctica 1 core y 1,2 GB. La próxima vez bastaría con `--cpus-per-task=1` y `--mem=2G`.

`seff` no muestra el uso de GPU. Para eso, y para ver más detalle, usa [`sacct`](https://slurm.schedmd.com/sacct.html):

```bash
# Resumen del trabajo y de cada uno de sus pasos (steps)
sacct -j <jobid> --format=JobID,JobName,State,Elapsed,Timelimit,AllocTRES%45,TotalCPU,MaxRSS

# Uso de GPU: gres/gpuutil (% de cómputo) y gres/gpumem (memoria de video)
sacct -j <jobid> --format=JobID,TRESUsageInAve%90,TRESUsageInMax%90
```

!!! note "Trabajos con varias GPUs"
    `gres/gpuutil` y `gres/gpumem` muestran la **suma** de todas las GPUs del trabajo.
    Por ejemplo, 2 GPUs al 100% aparecen como `gres/gpuutil=200`. Divide por el número
    de GPUs para obtener el valor por GPU.

### Reporte por trabajo (`#SENDJOBREPORT`)

Para recibir por correo un resumen de rendimiento **cada vez que termine un trabajo**, agrega la línea `#SENDJOBREPORT` a tu script de `sbatch`, junto a las líneas `#SBATCH`:

```bash
#!/bin/bash
#SBATCH --job-name=mi_job
#SBATCH --mem=8G
#SBATCH --time=01:00:00
#SBATCH --comment="Prueba de diagnóstico HIP/ROCm"
#SBATCH --partition=ialab-high-unlimit
#SBATCH --qos=debug
#SBATCH --nodelist=antuco
#SBATCH --gres=gpu:1
#SBATCH --output="resultado_%j.log"

#SENDJOBREPORT

python train.py
```

Para `sbatch`, `#SENDJOBREPORT` es un comentario, así que no cambia en nada la ejecución de tu trabajo. Al terminar, el clúster la busca en tu script y, si la encuentra, te envía el reporte.

**Qué incluye el correo:**

- **Datos del trabajo:** estado final, código de salida, nodo, tiempo pedido y tiempo real.
- **Eficiencias** de CPU, RAM, GPU, VRAM y tiempo, con barras de colores.
- **Sugerencias concretas**, por ejemplo: "reduce a `--mem=3G`", "ajusta `--time`" o "tu GPU estuvo al 0%: revisa que tus tensores estén en CUDA".
- **Diagnóstico** si el trabajo falló, se quedó sin memoria (OOM) o superó su tiempo.

**A qué dirección llega:** a la que indiques con `--mail-user`. Si no la indicas, a tu correo registrado en el clúster.

**Si no usas `#SENDJOBREPORT`**, no recibes correo, y al final del archivo de salida del trabajo (el que indicas con `-o`; por defecto `slurm-<jobid>.out`) aparece un aviso que te recuerda que puedes pedirlo.

**No se envía para:**

- **Sesiones interactivas** (`srun --pty bash`, `salloc`): no tienen script donde poner la línea. Revísalas con `seff`.
- **Trabajos lanzados con `sbatch --wrap="..."`:** tampoco pueden llevar la línea. Usa un archivo de script.

Los trabajos de menos de 30 segundos sí reciben el reporte, pero sin eficiencias: el clúster no alcanza a medir el uso en tan poco tiempo.

!!! tip "No es lo mismo que `--mail-type`"
    `--mail-type=END,FAIL` (como en el [ejemplo de `sbatch`](#ejecucion-batch-con-sbatch))
    envía solo un aviso corto de inicio o fin, sin métricas. `#SENDJOBREPORT` envía el
    reporte de rendimiento. Puedes usar los dos a la vez.

### Reporte mensual de uso

El **día 1 de cada mes, cerca de las 08:00**, cada usuario que tuvo trabajos durante el mes anterior recibe un resumen por correo. No necesitas activar nada. Si usas más de un clúster (KRAKEN, CENIA, PETEROA), recibes un reporte por cada uno.

**Qué incluye:**

- **Totales del mes:** trabajos terminados, core-horas, GPU-horas (y el % que representan del clúster) y tasa de éxito.
- **Eficiencias** de CPU, RAM, GPU, VRAM y tiempo, comparadas con el promedio del clúster y con tu mes anterior.
- **Estado de tus trabajos:** completados, fallidos, sin memoria (OOM), tiempo agotado y cancelados.
- **Tiempos:** cuánto esperaron tus trabajos en cola (comparado con el clúster) y cuánto duraron.
- **Los 3 trabajos con más recursos sin aprovechar**, con su JobID para revisarlos con `seff`.
- **Recomendaciones para el mes siguiente**, con valores concretos.

**Cuándo aparece cada recomendación:**

| Recomendación | Aparece cuando… | Qué te sugiere |
|---------------|-----------------|----------------|
| RAM | Usaste menos del 40% de la memoria que pediste | Un `--mem` según tu uso real, con 25% de margen |
| CPU | Usaste menos del 30% de los cores que pediste (solo trabajos sin GPU) | Cuántos cores pedir con `--cpus-per-task` |
| Tiempo | Tus trabajos usaron menos del 30% del `--time` que pediste | Un `--time` más ajustado (tu duración habitual + 30%) |
| GPU con poco uso | Tus GPUs estuvieron en promedio bajo el 30% de uso | Revisar la carga de datos (`num_workers`, `batch_size`, ubicación de los datos) |
| GPUs ociosas | Reservaste al menos 2 horas de GPU con menos del 10% de actividad, y eso fue al menos el 5% de tu uso de GPU | No pedir `--gres=gpu` si el trabajo no la usa |
| Sin memoria (OOM) | Algún trabajo murió por quedarse sin RAM | Aumentar `--mem` o revisar si tu código acumula memoria |
| Límite del clúster | Algún trabajo se cortó por llegar al tiempo máximo permitido | Guardar *checkpoints* para retomarlo |
| Fallos | Más del 30% de tus trabajos terminó con error (si lanzaste 5 o más) | Revisar `serror <jobid>` y probar primero con un trabajo corto (QoS `debug`) |

**Cómo se calcula:**

- Se consideran los trabajos que **terminaron** dentro del mes.
- Los trabajos de menos de 2 minutos cuentan en los totales, pero no en las eficiencias.
- Las sesiones interactivas (`bash`, `jupyter`, `vscode`) no cuentan en la eficiencia de CPU.
- Los promedios son ponderados: pesan más los trabajos que reservaron más recursos o más tiempo.