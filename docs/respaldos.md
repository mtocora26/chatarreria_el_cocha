# Respaldo y restauración

La copia de seguridad de producción la hace el workflow [backup.yml](../.github/workflows/backup.yml). El historial de Neon (6 h en el plan gratuito) no cuenta como respaldo.

## Qué hace

1. Todos los días a las 03:00 (hora de Colombia), y a demanda desde **Actions → Respaldo de la base de datos → Run workflow**, ejecuta `pg_dump` sobre producción.
2. Restaura esa copia en una base PostgreSQL temporal dentro del propio workflow y verifica que existan las tablas. Es la prueba de restauración: se repite con cada copia y nunca toca producción.
3. Cifra la copia con AES-256 (GPG) y la guarda como artefacto del workflow.

| Dato        | Valor                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Ubicación   | Artefactos de GitHub Actions de este repositorio (acceso solo para quienes tienen acceso al repositorio) |
| Cifrado     | AES-256 con la contraseña `BACKUP_PASSPHRASE`                                                            |
| Retención   | 30 días (una copia por día)                                                                              |
| Responsable | Manuel David Castro (administrador del repositorio)                                                      |
| Alerta      | Si el workflow falla, GitHub envía un correo al propietario del repositorio                              |

## Configuración (una sola vez)

En **Settings → Secrets and variables → Actions** crea dos secretos:

- `BACKUP_DATABASE_URL`: cadena de conexión de producción (Neon). Conviene un rol de solo lectura.
- `BACKUP_PASSPHRASE`: contraseña larga y aleatoria. Guárdala también fuera de GitHub (gestor de contraseñas): sin ella la copia no se puede abrir.

Por línea de comandos: `gh secret set BACKUP_DATABASE_URL` y `gh secret set BACKUP_PASSPHRASE` (piden el valor sin mostrarlo).

Después ejecuta el workflow una vez a mano y confirma que termina en verde **antes de cargar datos reales**.

## Restaurar

Siempre en una base nueva y vacía, nunca sobre producción hasta confirmar que la copia es la correcta.

1. Descarga el artefacto `respaldo-…` desde la ejecución del workflow que quieras recuperar y descomprime el ZIP.
2. Descifra: `gpg --output respaldo.dump --decrypt respaldo-AAAA-MM-DD.dump.gpg`
3. Crea una base vacía (por ejemplo una rama nueva en Neon) y restaura:
   `pg_restore --no-owner --no-privileges --dbname "<cadena de la base nueva>" respaldo.dump`
4. Comprueba los datos, por ejemplo `select count(*) from materiales;`.
5. Si hay que recuperar producción, apunta `DATABASE_URL` de Netlify a la base restaurada y vuelve a desplegar.

## Alcance y límites

- Se pierde como máximo un día de datos (la copia es diaria).
- Un respaldo se considera verificado cuando el workflow termina en verde: incluye la restauración de prueba.
- Si se pasa a Cloudflare R2 o Google Drive, solo cambia el último paso del workflow.
