FROM node:24-alpine

WORKDIR /app

COPY package.json .

RUN npm install 

ENV LINKEDIN_REDIRECT_URI="http://localhost:3000/auth/linkedin/callback"

COPY . .

EXPOSE 3000

CMD ["npm", "start"]