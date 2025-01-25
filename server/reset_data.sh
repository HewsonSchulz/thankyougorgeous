#!/bin/bash

rm db.sqlite3
rm -rf ./thankyougorgeousapi/migrations
rm -rf ./media/*
cp -r ./thankyougorgeousapi/fixtures/media/* ./media
python3 manage.py makemigrations thankyougorgeousapi
python3 manage.py migrate
python3 manage.py loaddata users tokens products categories orders
