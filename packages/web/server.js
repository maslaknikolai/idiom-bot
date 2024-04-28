import express from 'express';
import cors from 'cors';
import { createRequestHandler } from '@remix-run/express';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const PORT = process.env.PORT || 5174


const viteDevServer = process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();
app.use(cors());

app.use(
  viteDevServer
    ? viteDevServer.middlewares
    : express.static("build/client")
);

const build = viteDevServer
  ? () =>
      viteDevServer.ssrLoadModule(
        "virtual:remix/server-build"
      )
  : await import("./build/server/index.js");

// app.use(express.static('public'));

app.all( "*", createRequestHandler({ build }));

app.listen(PORT, () => {
  console.log(`Express server started on http://localhost:${PORT}`);
});
