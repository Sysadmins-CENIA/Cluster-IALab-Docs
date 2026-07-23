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
