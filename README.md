# Data Vis Final Project
Website demo should be up and running at dribble-dynamics.com so use that instead of trying to run locally.\
Local Running Instructions:
1. Install prereqs: Reactjs and Python with whatever required libraries. Ngrok if running on localhost.\
2. Set up MySQL database on localhost, use included sql dump file (backend/Data/dribbledynamics.sql) to populate database. In the backend folder add db_login.json of form\
{\
    "host":"localhost",\
    "user":"YOURUSERNAME",\
    "password":"YOURPASSWORD",\
    "database":"dribbledynamics"\
}
3. Run backend/Server/server.py and ngrok to tunnel to that localhost port\
	python ./server.py\
	ngrok http http://localhost:5000
4. Copy the ngrok link and paste it into frontend/public/server.json
5. in frontend folder start the react app\
	npm start
6. Everything should be ready to go         