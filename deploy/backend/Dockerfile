FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ADD backend.tar.gz ./
USER node
EXPOSE 3000
CMD ["node", "start.mjs"]
