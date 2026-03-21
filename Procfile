web: bin/scalingo_run_web
worker: bin/scalingo_run_worker
postdeploy: source bin/export_pg_vars.sh && python manage.py migrate && SQL_DIR=/app/sabredav/sql bash sabredav/init-database.sh
