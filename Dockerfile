FROM node:26-alpine3.22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production

FROM nginx:alpine

RUN adduser -D -H -u 1001 -s /sbin/nologin webuser

RUN mkdir -p /app/www

COPY --from=build /app/dist /app/www

COPY nginx.conf /etc/nginx/templates/default.conf.template

RUN chown -R webuser:webuser /app/www && \
    chmod -R 755 /app/www && \
    # Nginx needs to read and write to these directories
    chown -R webuser:webuser /var/cache/nginx && \
    chown -R webuser:webuser /var/log/nginx && \
    chown -R webuser:webuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R webuser:webuser /var/run/nginx.pid && \
    chmod -R 777 /etc/nginx/conf.d

EXPOSE ${PORT}

ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
ENV PORT=${PORT}

USER webuser

CMD ["nginx", "-g", "daemon off;"]
