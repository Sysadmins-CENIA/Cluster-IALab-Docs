@@ -0,0 +1,20 @@
# Políticas de SLURM

Debido a la diversidad de cargas que existen, definimos una política para todos los usuarios que se explican a continuación.

## Priorización de jobs

La priorización de jobs se hace por medio del Priority Multifactor Plugin de Slurm, los factores de una tarea que se consideran para evaluar su prioridad son los siguientes.

### Factor de edad (Age Factor)

El factor de edad evalúa el tiempo que un job se encuentra en estado PENDING y el momento en el que fue enviado. Si una tarea ha pasado más de 24 horas en ese estado, su prioridad subirá y será más propenso a ser elegido para entrar a ejecución.

### Factor de tamaño del job (Job Size Factor)

El factor de Job Size considera los recursos que han sido solicitados por un job. Si un job solicita menos recursos, tomará más prioridad para ser puesto en ejecución versus uno que utilice una mayor cantidad de recursos. Esto, con el fin de que las tareas de `debug` que se verán limitados a una pequeña cantidad de recursos, entren y salgan para evitar la espera.

### Factor de Fair-Share

El factor de Fair-Share es un valor asignado a través del algoritmo FairTree de Slurm. Este factor mide la cantidad de recursos utilizados en el período de 1 mes, mientras más recursos hayas utilizado durante ese período, tu prioridad bajará en la cola, con la finalidad que otros usuarios tengan la oportunidad de poner en ejecución sus propias tareas.
