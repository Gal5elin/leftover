FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ADD frontend.tar.gz ./
USER node
EXPOSE 3000
CMD ["node", "build/index.js"]
