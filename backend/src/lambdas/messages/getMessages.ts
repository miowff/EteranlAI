import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import messagesService from "src/services/messagesService";
import responseCreator from "src/utils/responseCreator";
import { contextSchema } from "../users/requestContextSchema";
import { PaginationOptions, queryStringParams } from "./getMessage/types";

export const getMessages = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { page, limit, individual } =
      event.queryStringParameters as unknown as PaginationOptions;
    const { userId } = event.requestContext.authorizer?.lambda;
    const result = await messagesService.getMessages(
      { page, limit, individual },
      userId
    );
    return responseCreator.default(JSON.stringify(result), 200);
  } catch (err) {
    return responseCreator.error(err);
  }
};

export const handler = middy()
  .use(httpErrorHandler())
  .use(validator({ eventSchema: transpileSchema(contextSchema) }))
  .use(validator({ eventSchema: transpileSchema(queryStringParams) }))
  .handler(getMessages);