#!/bin/bash

rm db.sqlite3
rm -rf ./thankyougorgeousapi/migrations
python3 manage.py makemigrations thankyougorgeousapi
python3 manage.py migrate
python3 manage.py loaddata users tokens products
