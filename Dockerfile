FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

COPY prisma prisma

RUN bun install

COPY src src
COPY tsconfig.json .
# COPY public public

# ENV NODE_ENV production
RUN bunx prisma generate
RUN bunx prisma db push
CMD ["bun", "run","dev"]

EXPOSE 3000