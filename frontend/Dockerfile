FROM node:18

WORKDIR /workspace
COPY . .

RUN npm cache clean --force
RUN npm install
# RUN npm run build

CMD ["npm", "run", "dev"]

EXPOSE 3000
