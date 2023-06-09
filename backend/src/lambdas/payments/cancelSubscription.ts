import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from "aws-lambda/trigger/api-gateway-proxy";
import stripeService from "src/services/stripeService";
import { responseCreator } from "src/utils/responseCreator";
import { validateAuthContextSchema } from "../types/validateAuthContextSchema";

const cancelSubscription = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = event.requestContext.authorizer?.lambda;
    await stripeService.cancelSubscriptionAtPeriodEnd(userId);
    return { statusCode: 200 };
  } catch (err) {
    return responseCreator.error(err);
  }
};
export const handler = middy()
  .use(httpErrorHandler())
  .use(validator({ eventSchema: transpileSchema(validateAuthContextSchema) }))
  .handler(cancelSubscription);
