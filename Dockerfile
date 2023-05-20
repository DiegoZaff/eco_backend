FROM node:18
# Create app directory
WORKDIR /usr/src/app

# Install nodemon globally
RUN npm install -g nodemon

# Install app dependencies
COPY package*.json ./
# RUN npm ci --omit=dev
RUN npm install


COPY . .

# Build app
#RUN npm run build
EXPOSE 3000
# CMD [ "nodemon", "src/index.ts" ]
CMD ["npm", "run", "dev"]