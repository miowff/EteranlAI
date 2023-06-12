import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyResultV2,
} from "aws-lambda/trigger/api-gateway-proxy";
import usersService from "src/services/usersService";
import refreshAccessToken from "src/utils/refreshAccessToken";
import responseCreator from "src/utils/responseCreator";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { transpileSchema } from "@middy/validator/transpile";
import validator from "@middy/validator";
import httpErrorHandler from "@middy/http-error-handler";
import { Action, bodySchema, pathParamsSchema } from "./auth/types";
import { SignUpLoginModel } from "src/models/users/user";

const auth = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.stringify(event.body);
    const payload: SignUpLoginModel = JSON.parse(body);
    const { action } =
      event.pathParameters as APIGatewayProxyEventPathParameters;
    switch (action) {
      case Action.login:
        const { accessToken, refreshToken } = await usersService.login(payload);
        return responseCreator.default(
          JSON.stringify({ accessToken: accessToken }),
          200,
          {
            "Set-Cookie": `refreshToken=${refreshToken}; HttpOnly`,
          }
        );
      case Action.signUp:
        await usersService.signUp(payload);
        return responseCreator.default(JSON.stringify("User created"), 200);
    }
    return { statusCode: 200 };
  } catch (err) {
    return responseCreator.error(err);
  }
};

export const handler = middy()
  .use(jsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(bodySchema) }))
  .use(validator({ eventSchema: transpileSchema(pathParamsSchema) }))
  .use(httpErrorHandler())
  .handler(auth);
