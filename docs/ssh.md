# Uso de SSH

Puedes conectarte al clúster con el comando `ssh <usuario>@kraken.ing.puc.cl`.

**Nota:** En las siguientes instrucciones, reemplaza `<usuario>` por el nombre de usuario que solicitaste al crear tu cuenta.

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

!!! alert "Nunca compartas tu llave privada"
    La llave privada (el archivo **sin** la extensión `.pub`) es secreta y solo debe permanecer en tu computador. Nunca la envíes por correo, chat ni la subas a ningún repositorio.

### 2.2 Copiando la llave SSH al clúster

Copia tu llave **pública** al clúster. Si tu llave está en `.ssh/id_ed25519.pub`, ejecuta:

```
# Opción 1: usar ssh-copy-id (la forma más simple)

ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@kraken.ing.puc.cl


# Opción 2: copiar manualmente (si no tienes ssh-copy-id)

cat ~/.ssh/id_ed25519.pub

# Copia el output y pégalo en ~/.ssh/authorized_keys en el servidor

# En el servidor, el archivo queda así:
# ~/.ssh/authorized_keys
# ssh-ed25519 AAAA...clave... tu@email.com
```

Luego podrás conectarte sin contraseña (o usando tu passphrase, si configuraste uno).

## 3. Opcional - Configuración de SSH

Puedes facilitar el uso de SSH creando y editando el archivo `.ssh/config`. Por ejemplo, puedes definir un "alias" para conectarte sin escribir la sintaxis completa `<usuario>@kraken.ing.puc.cl`.

Si no existe, crea el archivo `.ssh/config` y agrega las siguientes líneas, reemplazando `<usuario-local>` por tu usuario local y `<llave-pública>` por el archivo `.pub` de tu llave pública:

```bash
# Nodo de entrada
Host kraken
    HostName kraken.ing.puc.cl
    User <usuario>
    IdentityFile ~/.ssh/id_ed25519.pub

# Con salto intermedio o proxy jump
Host <nodo>
    HostName <nodo> # Por ejemplo hydra
    User <usuario>
    IdentityFile ~/.ssh/id_ed25519.pub
    ProxyJump <usuario>@kraken.ing.puc.cl
```

Ahora puedes conectarte simplemente con:

```bash
ssh kraken
```

Esto le indica al cliente SSH que use tu llave pública y que `kraken` es una abreviación de `<usuario>@kraken.ing.puc.cl`.

Si quieres conectarte directamente a un nodo de computo del clúster (por ejemplo, para copiar datos con `scp` o `rsync`), puedes usar el clúster como proxy.

Y puedes conectarte con:

```bash
ssh <nodo>
```
