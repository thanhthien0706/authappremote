import jwt from '@elysiajs/jwt'
import { env } from 'bun'
import { Elysia } from 'elysia'

const CreateElysia = (config?: ConstructorParameters<typeof Elysia>[0]) =>
    new Elysia({ ...config, })

export { CreateElysia }