# Servidor de notebooks (Jupyter)

Para trabajar con Jupyter en el clúster debes ejecutar el servidor a un nodo de cómputo **como un trabajo de SLURM**. Luego debes crear un **túnel SSH** desde tu computador hacia ese nodo para poder abrir el notebook en tu navegador local.

El flujo tiene tres pasos:

1. Enviar el servidor de notebooks con `sbatch`.
2. Crear un túnel SSH desde tu computador.
3. Conectarte desde el navegador a `localhost`.

!!! note "Prerrequisito: Jupyter instalado"
    Jupyter debe estar instalado en el entorno que actives dentro del script. Si aún no lo tienes, instálalo en tu virtualenv o entorno de conda con `pip install notebook`.

## 1. Enviar el servidor de notebooks

Usa un script como el siguiente para lanzar el servidor. Está disponible en la carpeta [samples](https://github.com/Sysadmins-CENIA/Cluster-IALab-Docs/tree/main/assets/samples/notebook) del repositorio.

```bash
#!/bin/bash
#SBATCH --job-name=notebook            # Nombre del trabajo
#SBATCH --mail-type=END,FAIL           # Enviar eventos al mail (NONE, BEGIN, END, FAIL, ALL)
#SBATCH --mail-user=<mail>             # El mail del usuario
#SBATCH --ntasks=1                     # Correr una sola tarea
#SBATCH --cpus-per-task=4              # Número de CPUs (threads) para el notebook
#SBATCH --mem=8gb                      # Memoria reservada para el trabajo
#SBATCH --partition=ialab              # Partición donde correr el trabajo
#SBATCH --nodelist=<node>              # Nodo donde correr el trabajo
#SBATCH --output=slurm/logs/%x_%j.log  # Nombre del output (%x=nombre del trabajo, %j=ID del trabajo)
#SBATCH --time=8:00:00                 # Tiempo limite del trabajo. Importante definirlo para no
                                       # mantener recursos ocupados si olvidas cerrar el servidor
##SBATCH --gres=gpu:1                  # Solicitar una GPU de ser necesario (descomentar si se necesita)

pwd; hostname; date

# Activa tu entorno acá (por ejemplo, tu virtualenv o entorno de conda).
# source ~/venv/bin/activate

# Reemplaza <port> por un número de puerto libre (ej: 8888).
PORT=<port>

echo "Iniciando servidor de notebooks"
echo ""
echo "Para conectarte, ejecuta en tu máquina local:"
echo "  ssh -L localhost:8888:$(hostname):${PORT} <usuario>@kraken.ing.puc.cl"
echo "Luego abre http://localhost:8888 en tu navegador."
echo "El token de acceso aparece más abajo en este mismo log."
echo ""

jupyter notebook --no-browser --ip="*" --port=${PORT}

echo "Trabajo $SLURM_JOBID finalizado"
date
```

Antes de enviarlo, reemplaza los valores entre `<>`:

- `<mail>`: tu correo para las notificaciones.
- `<node>`: el nodo de cómputo donde quieres correr el servidor.
- `<port>`: un número de puerto libre (por ejemplo `8888`). **Anótalo**, porque debe coincidir con el que usarás en el túnel SSH.

Guarda el script (por ejemplo como `run-notebook-server.sh`) y envíalo. Antes crea la carpeta donde se guardará el log, ya que SLURM no la crea automáticamente:

```bash
mkdir -p slurm/logs
sbatch run-notebook-server.sh
```

!!! note "Token de acceso"
    Jupyter genera un *token* de acceso que aparece en el archivo de log del trabajo (`slurm/logs/notebook_<jobid>.log`). Lo necesitarás en el paso 3 para abrir el notebook.

!!! warning "Recuerda el tiempo límite"
    Define siempre un `--time` acotado. Si olvidas cerrar el servidor, el trabajo seguirá ocupando recursos hasta que se agote ese tiempo.

## 2. Crear el túnel SSH

Con el servidor corriendo, abre una **nueva terminal en tu computador** y crea el túnel SSH:

```bash
ssh -L localhost:8888:<node>:<port> <usuario>@kraken.ing.puc.cl
```

Donde:

- `<node>`: el mismo nodo donde quedó corriendo el trabajo (el que indicaste en `--nodelist`).
- `<port>`: **debe ser igual** al `<port>` que definiste dentro del script.
- `<usuario>`: tu usuario del clúster.
- `8888`: el puerto local de tu computador que abrirás en el navegador. Puede ser cualquier puerto libre; si lo cambias, ajusta también la dirección del paso 3.

Deja esta terminal abierta: mientras el túnel esté activo, mantiene la conexión entre tu computador y el nodo de cómputo.

## 3. Conectarte desde el navegador

Con el túnel activo, abre tu navegador y entra a:

```
http://localhost:8888
```

Si Jupyter te pide un *token*, cópialo desde el log del trabajo (ver la nota del paso 1) y pégalo. ¡Listo! Ya puedes trabajar con tus notebooks ejecutándose en el clúster.

## Al terminar

Cuando termines, **cierra el servidor** para liberar los recursos en vez de esperar a que se agote el tiempo límite. Puedes cancelar el trabajo con:

```bash
scancel <jobid>
```

Puedes obtener el `<jobid>` con `squeue --me`.

## Solución de problemas

**El navegador muestra "connection refused" o no carga.**
Verifica que el túnel SSH del paso 2 siga abierto y que el trabajo ya esté corriendo (revisa el log del paso 1). Confirma también que el `<port>` del túnel sea exactamente el mismo que definiste dentro del script.

**El túnel SSH falla con "bind: Address already in use".**
El puerto local (`8888`) ya está ocupado en tu computador, probablemente por otro túnel o servidor. Usa otro puerto local en el comando (por ejemplo `localhost:8889:...`) y abre esa misma dirección en el navegador.

**Jupyter pide un token que no encuentro.**
El token se imprime en el log del trabajo (`slurm/logs/notebook_<jobid>.log`). Si no aparece, es probable que el servidor aún no haya terminado de iniciar; espera unos segundos y vuelve a revisar el log.

**El log dice "jupyter: command not found".**
Jupyter no está instalado en el entorno o no lo activaste. Revisa que la línea que activa tu entorno esté descomentada y que Jupyter esté instalado (ver el prerrequisito al inicio de la página).
