# Monitoreo y eficiencia de tus trabajos

En esta página aprenderás a revisar cuántos recursos (CPU, RAM, GPU y tiempo) usaron realmente tus trabajos, para pedir solo lo necesario. Así tus trabajos **esperan menos en cola**, para mas información revisar [Backfill](slurm.md/#Backfill-callback). Para saber cuánto usaron tus trabajos tienes tres herramientas:

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
    `--mail-type=END,FAIL` (como en el [ejemplo de `sbatch`](slurm.md/#ejecucion-batch-con-sbatch))
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