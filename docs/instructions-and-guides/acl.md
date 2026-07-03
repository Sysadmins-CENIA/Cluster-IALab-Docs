# Guía de Uso de para Compartir datos usando ACL (Access Control Lists) en Linux

Las ACL (Access Control Lists) permiten definir permisos detallados para usuarios y grupos específicos de forma individual, superando la limitación de los permisos tradicionales de Linux (usuario, grupo, otros).

Esta guía muestra cómo gestionar estos permisos utilizando ejemplos prácticos adaptados a nuestras rutas de almacenamiento.

!!! note
    En los siguientes ejemplos se asume el uso de la variable de entorno **`$WORKSPACE`**, la cual apunta a tu espacio de alto rendimiento en el disco local de cada uno de los nodos (`/workspace1/$PI/$USER`).

---

## Herramientas clave

Para administrar las ACL utilizaremos dos comandos principales:

* **`getfacl`**: muestra la lista de control de acceso de un archivo o directorio.
* **`setfacl`**: define, modifica o elimina las reglas de acceso.

---

## Consultar permisos con getfacl

Para inspeccionar los permisos de un archivo o carpeta:

```bash
getfacl $WORKSPACE/mi_proyecto
```

**Salida ejemplo:**

```text
# file: workspace1/$PI/$USER/mi_proyecto
# owner: $USER
# group: grupo_investigacion
user::rwx
group::r-x
other::---
```

---

## Modificar permisos con setfacl

El comando `setfacl` permite definir o modificar los permisos de acceso de un archivo o directorio. La estructura general del comando es la siguiente:

```bash
setfacl [opciones] <directorio_o_archivo>
```

Para modificar o añadir permisos, se utiliza el flag `-m` (modify) seguido de la especificación de permisos para usuarios (`u:`) o grupos (`g:`):

```bash
setfacl -m <tipo_entrada>:<nombre>:<permisos> <directorio_o_archivo>
```

### Dar acceso de lectura y escritura a un colaborador en tu $WORKSPACE

Si deseas permitir que un colaborador (`usuario_colaborador`) trabaje en tu espacio de alto rendimiento:

```bash
# Otorga lectura (r), escritura (w) y ejecución (x)
setfacl -m u:usuario_colaborador:rwx $WORKSPACE/mi_proyecto
```

!!! note "Consejo"
    El permiso de ejecución (`x`) en un directorio es necesario para que el usuario pueda entrar en él (usando `cd`) y listar su contenido.

### Compartir un directorio con permisos de solo lectura

Si solo quieres que un colaborador pueda visualizar y copiar tus resultados en tu almacenamiento `/home` (ej. en tu archivo):

```bash
# Otorga lectura (r) y ejecución (x)
setfacl -m u:usuario_colaborador:rx /home/$USER/archive/mis_resultados
```

### Dar acceso a un grupo completo de usuarios

Para que todos los miembros del grupo de investigación `grupo_bioinfo` puedan leer tu directorio:

```bash
setfacl -m g:grupo_bioinfo:rx $WORKSPACE/mi_proyecto
```

---

## Heredar permisos automáticamente (default ACLs)

Por defecto, los archivos y subcarpetas que se creen dentro de un directorio no heredan las reglas de ACL. Para configurar la herencia automática de permisos para elementos futuros, se utiliza el flag `-d` (default).

### Combinación recomendada (recursivo y por defecto)

Si quieres que tu colaborador tenga acceso tanto a lo que **ya existe** en el directorio, como a todo lo que se **cree en el futuro**:

```bash
# 1. Aplicar recursivamente (-R) a lo que ya existe
setfacl -R -m u:usuario_colaborador:rwx $WORKSPACE/mi_proyecto

# 2. Configurar la herencia por defecto (-d) para el futuro
setfacl -d -m u:usuario_colaborador:rwx $WORKSPACE/mi_proyecto
```

---

## La máscara de ACL (mask) y permisos efectivos

Uno de los conceptos más importantes y que suele causar confusión es la **máscara (`mask::`)**.

### ¿Qué es la máscara?

La máscara actúa como un **"techo" o límite máximo** de permisos aplicable para todos los usuarios y grupos específicos añadidos (no afecta al propietario del archivo ni a "otros").

Si una regla de ACL otorga permisos que superan a la máscara, el usuario **solo obtendrá la intersección de ambos** (esto se conoce como **permiso efectivo**).

### Ejemplo de restricción por máscara

Si otorgas acceso total a tu colaborador:

```bash
setfacl -m u:usuario_colaborador:rwx $WORKSPACE/mi_proyecto
```

Y luego reduces la máscara del directorio para que sea solo de lectura (`r--`):

```bash
setfacl -m m::r-- $WORKSPACE/mi_proyecto
```

Al inspeccionar con `getfacl` verás lo siguiente:

```text
# file: workspace1/$PI/$USER/mi_proyecto
owner: $USER
group: grupo_investigacion
user::rwx
user:usuario_colaborador:rwx  #effective:r--
mask::r--
other::---
```

!!! warning
    Como la máscara es `r--`, el permiso real o efectivo de `usuario_colaborador` es reducido a solo lectura (`#effective:r--`), a pesar de tener `rwx` explícito.
    Si un colaborador tiene problemas para escribir en una carpeta donde supuestamente tiene permisos, **revisa siempre la máscara**.

Para restaurar la máscara y permitir la escritura:

```bash
setfacl -m m::rwx $WORKSPACE/mi_proyecto
```

---

## Caso práctico: compartir el script gpt.py con diferentes permisos

Imagina que el usuario **Aldo** es el propietario del script `gpt.py` dentro de su `$WORKSPACE`. Aldo desea colaborar con tres compañeros asignándoles permisos específicos sobre este archivo:

1. **David**: solo debe poder **leer** el archivo (`r--`).
2. **José**: debe poder **leer y escribir** (modificar) el archivo (`rw-`).
3. **Diego**: debe saber que el archivo existe en la carpeta (ver el nombre), pero **no debe poder ni leer ni modificar** su contenido (`---`).

A continuación, se muestran dos formas de realizar esta configuración.

### Opción A: mediante comandos individuales (paso a paso)

Esta forma es ideal si vas agregando colaboradores de manera progresiva.

```bash
# 1. Dar acceso de solo lectura a David
setfacl -m u:david:r-- $WORKSPACE/gpt.py

# 2. Dar acceso de lectura y escritura a José
setfacl -m u:jose:rw- $WORKSPACE/gpt.py

# 3. Denegar explícitamente lectura y escritura a Diego
setfacl -m u:diego:--- $WORKSPACE/gpt.py
```

### Opción B: en una sola línea (comando combinado)

Si quieres aplicar todas las reglas al mismo tiempo, puedes separar las instrucciones con comas:

```bash
setfacl -m u:david:r--,u:jose:rw-,u:diego:--- $WORKSPACE/gpt.py
```

### Comprobación del resultado (getfacl)

Una vez ejecutados los comandos, Aldo ejecuta `getfacl $WORKSPACE/gpt.py` para verificar los accesos. La salida esperada es:

```text
# file: /workspace1/$PI/aldo/gpt.py
# owner: aldo
# group: grupo_investigacion
user::rw-
user:david:r--
user:jose:rw-
user:diego:---
mask::rw-
other::---
```

!!! note
    Diego podrá ver el nombre del archivo `gpt.py` al hacer `ls` en la carpeta (siempre y cuando tenga permisos de lectura y ejecución en el directorio contenedor), pero si intenta leer el script (`cat gpt.py`) o editarlo, el sistema le devolverá el mensaje: `Permission denied` (permiso denegado).

---

## Eliminar permisos de ACL

### Eliminar permisos de un usuario específico

```bash
setfacl -x u:usuario_colaborador $WORKSPACE/mi_proyecto
```

### Eliminar permisos por defecto de un usuario específico

```bash
setfacl -d -x u:usuario_colaborador $WORKSPACE/mi_proyecto
```

### Limpiar todas las ACLs (restaurar permisos tradicionales)

Si quieres revocar todas las reglas de ACL y volver al esquema estándar de permisos de Linux:

```bash
setfacl -b $WORKSPACE/mi_proyecto
```

---

## Preservar ACLs al copiar o sincronizar

**Con `cp`**: Utiliza el flag `-p` para conservar los atributos y ACLs:

```bash
cp -p archivo.txt /home/$USER/archive/
```

**Con `rsync`**: Utiliza el flag `-A` (o `--acls`) para transferir las ACLs:

```bash
rsync -avA $WORKSPACE/mi_proyecto /home/$USER/archive/
```
