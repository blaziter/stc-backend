FROM node:26.12

WORKDIR /usr/app

# Install pnpm explicitly and copy manifests first for reproducible, cacheable installs.
RUN npm install --global pnpm@10

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install --frozen-lockfile --prod=false

COPY . .

RUN npm install --global @nestjs/cli

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]