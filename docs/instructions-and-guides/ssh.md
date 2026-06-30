# Uso de SSH

El nodo de entrada al clúster es `kraken.ing.puc.cl`. Para conectarte usa el comando:

```bash
ssh <usuario>@kraken.ing.puc.cl
```

**Nota:** En las siguientes instrucciones, reemplaza `<usuario>` por el nombre de usuario que solicitaste al crear tu cuenta.

En esta guía verás cómo:

1. Cambiar tu contraseña por defecto (**obligatorio**).
2. Configurar una llave SSH para conectarte sin contraseña (**recomendado**).
3. Crear alias y saltos a nodos de cómputo con `.ssh/config` (**opcional**).

!!! note "Cliente SSH"
    En Linux y macOS el cliente `ssh` ya viene instalado. En Windows puedes usarlo desde PowerShell (incluido en Windows 10 y posteriores) o desde WSL. Los comandos de esta guía son los mismos en todos los casos.

## 1. Obligatorio - Cambio de contraseña

Lo primero es cambiar tu contraseña por defecto para evitar accesos no autorizados. Conéctate al clúster y ejecuta el comando `passwd`:

```bash
[pc-personal]$ ssh <usuario>@kraken.ing.puc.cl
[kraken]$ passwd
[kraken]Current password:
[kraken]New password:
[kraken]Retype new password:
[kraken]passwd: Password updated successfully
[kraken]$ exit
[pc-personal]$
```

## 2. Recomendado - Llave SSH

Este paso es opcional, pero muy recomendado por seguridad y comodidad.

### 2.1 Creando una llave SSH

El procedimiento es el mismo en Linux, Mac o WSL en Windows:

```bash
ssh-keygen -t ed25519 -C "tu@email.com"

# Acepta la ubicación por defecto: ~/.ssh/id_ed25519
# Puedes agregar una passphrase (recomendado) o dejarla vacía

# Ver las claves generadas
ls ~/.ssh/
# id_ed25519       ← clave privada (NUNCA compartas esto)
# id_ed25519.pub   ← clave pública (ésta la compartes)
```

!!! danger "Nunca compartas tu llave privada"
    La llave privada (el archivo **sin** la extensión `.pub`) es secreta y solo debe permanecer en tu computador. Nunca la envíes por correo, chat ni la subas a ningún repositorio.

### 2.2 Copiando la llave SSH al clúster

Copia tu llave **pública** al clúster. Si tu llave está en `.ssh/id_ed25519.pub`, ejecuta:

```bash
# Opción 1: usar ssh-copy-id (la forma más simple)

ssh-copy-id -i ~/.ssh/id_ed25519.pub <usuario>@kraken.ing.puc.cl


# Opción 2: copiar manualmente (si no tienes ssh-copy-id)

cat ~/.ssh/id_ed25519.pub

# Copia el output y pégalo en ~/.ssh/authorized_keys en el servidor

# En el servidor, el archivo queda así:
# ~/.ssh/authorized_keys
# ssh-ed25519 AAAA...clave... tu@email.com
```

La primera vez que te conectes, `ssh-copy-id` te pedirá tu contraseña del clúster para instalar la llave. Después de eso podrás conectarte sin contraseña (o usando tu passphrase, si configuraste una).

## 3. Opcional - Configuración de SSH

Puedes facilitar el uso de SSH creando y editando el archivo `.ssh/config` en tu computador local. Por ejemplo, puedes definir un "alias" para conectarte sin escribir la sintaxis completa `<usuario>@kraken.ing.puc.cl`.

Si no existe, crea el archivo `.ssh/config` y agrega las siguientes líneas, reemplazando `<usuario>` por tu usuario del clúster:

```bash
# Nodo de entrada
Host kraken
    HostName kraken.ing.puc.cl
    User <usuario>
    IdentityFile ~/.ssh/id_ed25519

# Con salto intermedio o proxy jump
Host <nodo>
    HostName <nodo> # Por ejemplo hydra
    User <usuario>
    IdentityFile ~/.ssh/id_ed25519
    ProxyJump kraken
```

!!! warning "`IdentityFile` apunta a la llave privada"
    En `IdentityFile` debes indicar la llave **privada** (`~/.ssh/id_ed25519`, **sin** la extensión `.pub`). El cliente SSH usa la llave privada para autenticarse; la pública ya quedó instalada en el servidor en el paso anterior.

Ahora puedes conectarte simplemente con:

```bash
ssh kraken
```

Esto le indica al cliente SSH que use tu llave y que `kraken` es una abreviación de `<usuario>@kraken.ing.puc.cl`.

Si quieres conectarte directamente a un nodo de cómputo del clúster (por ejemplo, para copiar datos con `scp` o `rsync`), puedes usar el clúster como salto intermedio. Gracias a `ProxyJump kraken`, la conexión pasa primero por el nodo de entrada y desde ahí alcanza el nodo interno.

Y puedes conectarte con:

```bash
ssh <nodo>
```
