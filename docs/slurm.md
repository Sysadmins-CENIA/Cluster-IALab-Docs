# Uso de SLURM

## Introducción

**SLURM** (_Simple Linux Utility for Resource Management_) es el sistema de gestión de recursos y planificación de trabajos (_scheduler_) utilizado en el clúster. Su función principal es administrar las colas de ejecución, asignar recursos de cómputo y coordinar el uso eficiente de los nodos disponibles.

Actualmente, SLURM es utilizado por más del 60% de los supercomputadores listados en el [top500](https://www.top500.org/), convirtiéndose en el estándar de facto en entornos HPC (_High Performance Computing_).

La versión instalada en el clúster es la [24.05.0](https://slurm.schedmd.com/).


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

| Acción | Comando | Notas |
|--------|---------|-------|
| Ver estado general del cluster | `sinfo` | Usar `sinfo -s` para vista resumida |
| Ver trabajos en la cola | `squeue` | `squeue -u $USER` para trabajos propios |
| Versión mejorada de squeue | `sq` | Comando personalizado del cluster |
| Ver detalles de un trabajo | `scontrol show job <jobid>` | Alternativa personalizada: `sshow <jobid>` |
| Enviar un script batch | `sbatch script.sh` | |
| Enviar trabajo interactivo | `srun --pty bash` | Ejemplo: `srun -n 2 python main.py` |
| Cancelar un trabajo | `scancel <jobid>` | |
| Ver recursos disponibles | `sfree` | Comando personalizado del cluster |
| Ver errores de un job | `serror <jobid>` | Comando personalizado del cluster |
| Ver salida estándar de un job | `stail <jobid>` | Comando personalizado del cluster |
| Ver historial de trabajos | `sacct -u $USER` | |


### Comandos creados por el Team Cluster

- `sq`: Versión mejorada de `squeue`.
- `sshow <jobid>`: Versión mejorada de `scontrol show jobid -dd <jobid>`. También se puede utilizar con el nombre de un nodo para ver información del mismo.
e.g.: `scontrol show ahsoka`
- `sfree`: Muestra las CPU / RAM / GPU disponibles en el cluster, según las tareas en la cola de SLURM.
- `serror <jobid>`: Muestra output de errores del job.
- `stail <jobid>`: Muestra Std Output de job.


### [sinfo](https://slurm.schedmd.com/sinfo.html)
Imprime información sobre las particiones del cluster y sus estados.

**Ejemplo:**
```
user@kraken:~$ sinfo
PARTITION    AVAIL  TIMELIMIT  NODES  STATE NODELIST
ialab           up 8-00:00:00      3    mix hydra,llaima,ventress
ialab           up 8-00:00:00      3   idle ahsoka,antuco,scylla
llaima-pixiu    up 8-00:00:00      1    mix llaima
hpc-iic3533     up      15:00      1    mix ventress
hpc-iic3533     up      15:00      1   idle ahsoka
all             up 1-00:00:00      3    mix hydra,llaima,ventress
all             up 1-00:00:00      3   idle ahsoka,antuco,scylla

```

### [squeue](https://slurm.schedmd.com/squeue.html)
Permite ver el estado de los trabajos que se encuentran en la cola de Slurm.
Además es posile filtrar la información del trabajo por usuario usando el parametro ```-u [usuario]```.


**Ejemplo:**
```
user@kraken:~$ squeue
             JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
              2608 hpc-iic35 kmeans_1  lpulido PD       0:00      1 (MaxMemPerLimit)
              2607 hpc-iic35 kmeans_1  lpulido PD       0:00      1 (MaxMemPerLimit)
              2542 hpc-iic35 kmeans_m  cortega PD       0:00      2 (MaxMemPerLimit)
              2280 hpc-iic35 kmeans_m csaravia PD       0:00      1 (MaxMemPerLimit)
              2571     ialab AffordNa jdiazram PD       0:00      1 (Resources)
              2611     ialab notagen_  amahns1  R    2:38:51      1 llaima
              2570     ialab AffordNa jdiazram  R   10:01:24      1 hydra
              2510     ialab spoc_rea   yhelem  R 1-05:01:34      1 hydra
              2494     ialab    train fuentes1  R 1-10:00:02      1 ventress
              2446     ialab tess_pro   yhelem  R 1-23:39:24      1 hydra
              2439     ialab ViT_Soko pedropal  R 2-03:02:31      1 llaima
              2438     ialab ViT_Soko pedropal  R 2-03:02:35      1 llaima
              2397     ialab    train fuentes1  R 3-08:02:26      1 ventress
              2382     ialab spoc_rea   yhelem  R 4-01:47:59      1 ventress
              2381     ialab spoc_rea   yhelem  R 4-01:50:32      1 ventress
              2380     ialab tess_pro   yhelem  R 4-01:57:54      1 ventress


```

### sq (Comando creado por nosotros en CENIA)
Es una versión mejorada de squeue

**Ejemplo:**
```
user@kraken:~$ sq

 JOBID NAME                                        USER      TIME        TASKS CPU/TSK CPU   MEM  NODE          GPU
 2380  tess_process_astro_v                        yhelem    4-01:58:37  1     1       2     32G  ventress      2080_super:1
 2381  spoc_read30                                 yhelem    4-01:51:15  1     4       4     32G  ventress      -
 2382  spoc_read31                                 yhelem    4-01:48:42  1     4       4     32G  ventress      -
 2397  train                                       fuentes1  3-08:03:09  1     8       8     32G  ventress      2080_super:1
 2438  ViT_Sokoban                                 pedropal  2-03:03:18  1     8       8     64G  llaima        a40:1
 2439  ViT_Sokoban                                 pedropal  2-03:03:14  1     8       8     64G  llaima        a40:1
 2446  tess_process_astro                          yhelem    1-23:40:07  1     1       2     16G  hydra         titan_rtx:1
 2494  train                                       fuentes1  1-10:00:45  1     8       8     32G  ventress      2080_super:1
 2510  spoc_read_39                                yhelem    1-05:02:17  1     4       4     24G  hydra         -
 2570  AffordNav-task5(LM+R4R+R2R)(2.8-10-007-006) jdiazram  10:02:07    1     24      24    128G hydra         titan_rtx:4
 2611  notagen_run1_resume                         amahns1   02:39:34    1     8       8     32G  llaima        a40:2
 2280  kmeans_mpi                                  csaravia  -           1     8       -     233G
 2542  kmeans_mpi                                  cortega   -           8     2       -     466G
 2571  AffordNav-task1(LM+R4R+R2R)(2.8-10-007-006) jdiazram  -           1     24      -     128G
 2607  kmeans_1x2                                  lpulido   -           1     2       -     233G
 2608  kmeans_1x4                                  lpulido   -           1     4       -     233G
```

### [srun](https://slurm.schedmd.com/srun.html)
Envía un trabajo iterativo a la cola de ejecución de Slurm.
Se debe definir el parametro ```-n [numero]``` para definir el numero de ejecucciones paralelas.

**Ejemplo:**
```
$ srun -n 2 python main.py
```

### [sbatch](https://slurm.schedmd.com/sbatch.html)
Permite añadir un trabajo a a cola de Slurm.

**Ejemplo:**
```
$ cat script.sh
#!/bin/bash
#SBATCH --job-name=compile
#SBATCH -t 0-2:00                    # tiempo maximo en el cluster (D-HH:MM)
#SBATCH -o c_job.out                 # STDOUT (A = )
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
```
$ cat script-array.sh
#!/bin/bash
#SBATCH --job-name=trabajito
#SBATCH -t 0-2:00                    # tiempo maximo en el cluster (D-HH:MM)
#SBATCH -o slurm-%a.out              # STDOUT
#SBATCH -e slurm-%a.err              # STDERR
#SBATCH --mail-type=ALL              # notificacion cuando el trabajo termine o falle
#SBATCH --mail-user=usuario@uc.cl    # mail donde mandar las notificaciones
#SBATCH --chdir=/user/miusuario      # direccion del directorio de trabajo
#
#SBATCH --ntasks 1                   # 1 trabajo
#SBATCH --array 1-100%10             # 100 procesos, 10 simultáneos
#SBATCH --partition=ialab            # partición donde correrá tu trabajo (proceso)

python3 main.py $SLURM_ARRAY_TASK_ID

$ sbatch script.sh
Submitted batch job 60
```

### [scancel](https://slurm.schedmd.com/scancel.html)
Permite cancelar un trabajo por su JobID

**Ejemplo:**
```
$ sbatch script.sh
Submitted batch job 14

$ scancel 14
```
### [scontrol](https://slurm.schedmd.com/scontrol.html)
Es usado para ver o modificar el estado de un trabajo.

**Ejemplo:**
```
$ sbatch script.sh
Submitted batch job 29

$ scontrol hold 29
```
El comando hold detendrá la ejecución mientras que release la retomará.
```
$ scontrol release 29
```

### sshow <jobid> (Comando creado por nosotros en CENIA)
Es usado para ver información relevante de un trabajo

**Ejemplo:**
```
$ sshow 250

JobId      : 250
JobName    : traindummy
UserId     : username
GroupId    : ialab
Partition  : ialab-high
NumNodes   : 1
Nodes      : grievous
ReqNodeList: grievous
ExcNodeList: (null)
NodeList   : grievous
BatchHost  : grievous
NumTasks   : 1
CPUs/Task  : 1
NumCPUs    : 2
cpu        : 2
Gres       : gpu:1
GRES_IDX   : gpu(IDX:1)
CPU_IDs    : 0-1
RunTime    : 4-19:17:12
TimeLimit  : 8-00:00:00
SubmitTime : 2020-02-27T14:51:15
StartTime  : 2020-02-27T17:24:19
EndTime    : 2020-03-06T17:24:19
JobState   : RUNNING
ExitCode   : 0:0
WorkDir    : /home/username
Command    : /home/username/train_dummy.sh
StdOut     : /home/username/logs/250-4294967294-dummy.log
```


### sfree
Es usado para saber qué recursos hay disponibles en el cluster

**Ejemplo:**
```
$ sfree

+-----------+-------------------+---------------------+------------------------------------+
| NODE      | CPU (avail/total) | RAM (avail/total)   | Available GPUs                     |
+-----------+-------------------+---------------------+------------------------------------+
| ahsoka    | 38/38             | 227.76/227.76[GiB]  |       TITAN X (Pascal) (12GB): 3/3 |
|           |                   |                     |    GeForce GTX 1080 Ti (11GB): 1/1 |
+-----------+-------------------+---------------------+------------------------------------+
| antuco    | 124/124           | 479.24/479.24[GiB]  |     AMD Instinct MI210 (64GB): 2/2 |
+-----------+-------------------+---------------------+------------------------------------+
| hydra     | 6/36              | 59.75/227.75[GiB]   |              TITAN RTX (24GB): 3/8 |
+-----------+-------------------+---------------------+------------------------------------+
| llaima    | 100/124           | 732.42/891.67[GiB]  |             Nvidia A40 (48GB): 4/8 |
+-----------+-------------------+---------------------+------------------------------------+
| scylla    | 38/38             | 227.76/227.76[GiB]  |    GeForce RTX 2080 Ti (11GB): 3/3 |
|           |                   |                     |    GeForce GTX 1080 Ti (11GB): 4/4 |
+-----------+-------------------+---------------------+------------------------------------+
| ventress  | 10/36             | 67.74/227.74[GiB]   |  GeForce RTX 2080 SUPER (8GB): 5/8 |
+-----------+-------------------+---------------------+------------------------------------+

```


## Variables de Entorno Relevantes en Trabajos de SLURM


Slurm establecera o preestablecerá las variables de entorno que puedan ser usadas en el script. En la siguiente tabla se muestras las mas usadas:

|Descripción      |Slurm                        |
|-----------------|-----------------------------|
|JobID            |$SLURM_JOBID                 |
|Submit Directory |$SLURM_SUBMIT_DIR (default)  |
|Submit Host      |$SLURM_SUBMIT_HOST           |
|Node List        |$SLURM_JOB_NODELIST          |
|Job Array Index  |$SLURM_ARRAY_TASK_ID         |
|User Workspace   |$WORKSPACE                   |
|Archive Directory|$ARCHIVE                     |
|Scratch Directory|$SCRATCH                     |


## Flags comunes

A continuación se muestra una lista de los flags más comunes que un usuario puede incluir en su trabajo, ya sean para solicitar recursos o características para el trabajo.

|Descripción      |Slurm                           |
|-----------------|--------------------------------|
|Nombre del trabajo       |#SBATCH --job-name=My-Job_Name  |
|Número de nodos solicitados |#SBATCH --nodes=1 |
|Número de cores por nodo solicitados |#SBATCH --ntasks-per-node=24        |
|Copia las variables de entorno del usuario  |#SBATCH --export=[ALL\|NONE\|Variables]  |
|Restricción de tiempo |#SBATCH --time=24:0:0   |
|Reiniciar un trabajo en caso de falla|#SBATCH --requeue  |
|Compartir los nodos |#SBATCH --shared |
|Reservar los nodos para uso exclusivo|#SBATCH --exclusive |
|Uso de un recurso específico |#SBATCH --constraint="XXX"|
|Uso de memoria |#SBATCH --mem=[mem \|M\|G\|T] o --mem-per-cpu |
|Email usuario |#SBATCH --mail-user=username@uc.cl |
|Notifica al usuario por evento |#SBATCH --mail-type=ALL / BEGIN / END or FAIL |

|Solicitud nodo específico |#SBATCH --nodelist=Antuco |


## Flags importantes en tu trabajo

Es importante conocer los flags que puedes utilizar para una adecuada administración de los recursos dado que su correcto uso traerá beneficios tanto para scheduler como para tu trabajo.

#### Restricción de tiempo

Para restringir el tiempo que correrá un trabajo se hace uso de [--time](https://slurm.schedmd.com/sbatch.html)  donde se específica el tiempo mínimo y máximo que tiene permitido correr dentro del cluster. Por un lado, si el tiempo solicitado no es suficiente el programa será cortado y los resultados se perderán.  Por otro lado, si el tiempo específicado es demasiado el trabajo permanecerá en la cola por mucho tiempo mientras el scheduler busca los recursos que solicitó, además, una vez asignados los recursos otros programas no podrán acceder a ellos afectando la eficiencia de la administración de Slurm.

**Ejemplo:**
Al incluir la siguiente línea en el script el tiempo máximo serán dos horas.

```
#SBATCH -t 0-2:00                               # time (D-HH:MM)
```

#### Nodos

Reservar un nodo para uso es posible con el comando [--exlusive](https://slurm.schedmd.com/sbatch.html), sin embargo el uso de este flags se recomienda ser usado en el caso que el programa que se desea correr depende en gran parte de la transferencia de datos entre los trabajos, esto justificaría la asignación a un solo usuario de un nodo completo.En la mayoŕía de los casos los trabajos son relativamente pequeños permitiendo que puedan compartir un mismo nodo, para todas estas situaciones se mantendrá la configuración determinada [--shared](https://slurm.schedmd.com/sbatch.html) en el nodo.

El número de nodos que se desea utilizar es definidos con [--nodes o -N](https://slurm.schedmd.com/sbatch.html) donde es posible usar un intervalo de nodos necesarios como 2-4  para este caso el scheduler correra el programa cuando encuentre al menos 2 nodos disponibles si encuentra los 4 correrá utilizando los 4 sugeridos, en cambio si específica un número de nodos específicos como 5 no correrá hasta hallar disponibles 5. Se recomienda verificar las disponibilidad de los nodos antes de lanzar el trabajo utilizando el comando [--sinfo](https://slurm.schedmd.com/sinfo.html) como se mencionó anteriormente.

### Uso de GPU

Para solicitar el uso de gpu en tu trabajo se utilizan --gres=gpu ó --gres=gpu:N donde N es el número de gpus por nodo.

**Ejemplo:**
```
#SBATCH -t 0-2:00                               # time (D-HH:MM)
#SBATCH -N 4
#SBATCH --gres=gpu

cd /slurm/gpuExamples
./run_my_gpu_code

```
## Scripts básicos
[Acá](slurm_examples.md) podrás encontrar algunos scripts básicos para el uso de slurm en determinados casos.
