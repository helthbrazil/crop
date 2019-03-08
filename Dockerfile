FROM dockerhub.policiamilitar.mg.gov.br/devops/node-nexus AS builder

ARG AMBIENTE

ADD . /build

WORKDIR /build

RUN npm config set registry http://maven.policiamilitar.mg.gov.br/nexus/repository/npm-group \
    && npm install -g @angular/cli@1.7.4 \
    && npm install \
    && ng build --prod --aot=false --env=${AMBIENTE} --bh=/

FROM nginx:1.11

RUN echo "America/Sao_Paulo" > /etc/timezone && dpkg-reconfigure -f noninteractive tzdata

COPY --from=builder /build/dist /usr/share/nginx/html
