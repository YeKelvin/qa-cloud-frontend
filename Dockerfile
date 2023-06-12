# FROM node:10
# COPY ./ /app
# WORKDIR /app
# RUN npm install && npm run build

FROM public.ecr.aws/docker/library/nginx
# COPY --from=0 /app/dist /app
COPY ./dist /app
COPY nginx.conf /etc/nginx/nginx.conf
