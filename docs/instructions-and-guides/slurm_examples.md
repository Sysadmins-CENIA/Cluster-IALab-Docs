# Ejemplos de scripts SLURM

En esta página encontrarás scripts de ejemplo que puedes usar como punto de partida para enviar tus propios trabajos al clúster. Cada uno cubre un caso de uso distinto: un proceso simple, un *array* de trabajos y un trabajo con GPU.

Todos los ejemplos asumen que tu programa se ejecuta con `python main.py`; reemplaza ese comando por el de tu propio código. Para enviar cualquiera de estos scripts al clúster, guárdalo en un archivo (por ejemplo `job.sh`) y ejecútalo con `sbatch job.sh`.

También están disponibles en la carpeta [samples](https://github.com/Sysadmins-CENIA/Cluster-IALab-Docs/tree/main/assets/samples) del repositorio.

## Un proceso

Esta es la estructura básica para ejecutar un programa en SLURM: una sola tarea, en un solo CPU. Sirve como plantilla para la mayoría de los trabajos sencillos.

Las directivas `#SBATCH` al inicio del archivo definen los recursos y la configuración del trabajo (nombre, memoria, tiempo límite, notificaciones por correo, etc.). El cuerpo del script es un script de Bash normal que se ejecuta una vez que SLURM asigna los recursos.

`$SLURM_JOBID` es una variable de entorno que SLURM asigna automáticamente con el ID del trabajo; resulta útil para identificar archivos de salida o registrar mensajes.

```bash
#!/bin/bash
#SBATCH --job-name=job-example      # Nombre del trabajo
#SBATCH --mail-type=END,FAIL        # Enviar eventos al mail (NONE, BEGIN, END, FAIL, ALL)
#SBATCH --mail-user=usuario@uc.cl   # El mail del usuario
#SBATCH --ntasks=1                  # Correr una sola tarea
#SBATCH --mem=1gb                   # Memoria para el trabajo
#SBATCH --time=0-00:05:00           # Tiempo límite d-hrs:min:sec
#SBATCH --output=test_%j.log        # Nombre del output (%j se reemplaza por el ID del trabajo)
#SBATCH --error=test_%j.err         # Output de errores (opcional)
#SBATCH --partition=ialab           # Partición del clúster
pwd; hostname; date

echo "Corriendo un programa de python en un solo CPU core"

python main.py

echo "Finished with job $SLURM_JOBID"
date
```

## Array

Un *array* de trabajos permite lanzar muchas copias del mismo script con una sola directiva `#SBATCH`, ideal para paralelizar tareas independientes (por ejemplo, ejecutar el mismo programa con distintos parámetros o sobre distintos datos). Cada copia se encola como una tarea separada del *array*.

La directiva `--array=1-100%10` del ejemplo crea 100 tareas y permite que se ejecuten como máximo 10 de forma simultánea. Dentro de cada tarea, la variable de entorno `$SLURM_ARRAY_TASK_ID` contiene el índice correspondiente (del 1 al 100), por lo que puedes pasárselo a tu programa para que sepa qué porción del trabajo le toca procesar.

Aquí partimos del ejemplo de "Un proceso", pero la misma técnica aplica a cualquiera de los casos de este documento.


```bash
#!/bin/bash
#SBATCH --job-name=array-example          # Nombre del trabajo
#SBATCH --mail-type=END,FAIL              # Enviar eventos al mail (NONE, BEGIN, END, FAIL, ALL)
#SBATCH --mail-user=usuario@uc.cl         # El mail del usuario
#SBATCH --ntasks=1                        # Correr una sola tarea
#SBATCH --mem=1gb                         # Memoria para el trabajo
#SBATCH --time=0-00:05:00                 # Tiempo límite d-hrs:min:sec
#SBATCH --output=results/array_%A-%a.log  # Output (%A se reemplaza por el ID del trabajo maestro, %a se reemplaza por el índice del arreglo)
#SBATCH --array=1-100%10                  # 100 procesos, 10 simultáneos
#SBATCH --partition=ialab                 # Partición del clúster
pwd; hostname; date

python main.py $SLURM_ARRAY_TASK_ID

date
```

## GPU

Para usar GPUs debes solicitarlas explícitamente con la directiva `--gres=gpu:N`, donde `N` es la cantidad de GPUs que necesitas. SLURM se encarga de reservarlas y de exponerlas a tu programa.

El siguiente script reserva 2 GPUs (`--gres=gpu:2`) y ejecuta `python main.py`. Si necesitas un modelo de GPU específico, puedes pedirlo con la forma `--gres=gpu:marca:N`. Recuerda además indicar la partición del clúster con `--partition`.

```bash
#!/bin/bash
#SBATCH --job-name=gpu-example       # Nombre del trabajo
#SBATCH --output=test_%j.log         # Nombre del output (%j se reemplaza por el ID del trabajo)
#SBATCH --error=test_%j.err          # Output de errores (opcional)
#SBATCH --ntasks=2                   # Correr 2 tareas
#SBATCH --cpus-per-task=1            # Número de cores por tarea
#SBATCH --distribution=cyclic:cyclic # Distribuir las tareas de modo cíclico
#SBATCH --time=0-00:05:00            # Tiempo límite d-hrs:min:sec
#SBATCH --mem-per-cpu=2000mb         # Memoria por proceso
#SBATCH --mail-type=END,FAIL         # Enviar eventos al mail (NONE, BEGIN, END, FAIL, ALL)
#SBATCH --mail-user=usuario@uc.cl    # El mail del usuario
#SBATCH --partition=ialab            # Partición del clúster
#SBATCH --gres=gpu:2                 # Usar 2 GPUs (se pueden usar N GPUs de marca específica de la manera --gres=gpu:marca:N)
date;hostname;pwd

srun --gres=gpu:2 -n 2 python main.py

date
```
