import { redirectUrl } from "../../controllers/url.controller";
import { getOriginalUrl } from "../../services/url.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/url.service");
jest.mock("../../../../config/server.config", () => ({
  server: { app: { BASE_URL: "http://server-base.url" } },
  client: { app: { BASE_URL: "http://server-base.url" } },
}));
jest.mock("redis", () => ({
  createClient: jest.fn(() => ({
    on: jest.fn(),
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  })),
}));

interface ExtendedRequest extends Request {
  location: {
    country: string;
    city: string;
  };
}

describe("redirectUrl Controller", () => {
  let req: Partial<ExtendedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: { code: "shortCode" },
      location: { country: "Country", city: "City" },
    };
    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should redirect to the original URL if found", async () => {
    const mockUrl = "http://original.url";
    (getOriginalUrl as jest.Mock).mockResolvedValue(mockUrl);

    await redirectUrl(req as Request, res as Response, next);

    expect(getOriginalUrl).toHaveBeenCalledWith("shortCode", "Country, City");
    expect(res.redirect).toHaveBeenCalledWith(mockUrl);
  });

  it("should respond with 404 if no URL is found", async () => {
    (getOriginalUrl as jest.Mock).mockResolvedValue(null);

    await redirectUrl(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "No URL found",
      failed: true,
    });
  });

  it("should call next with an error if an exception occurs", async () => {
    const error = new Error("Error finding URL");
    (getOriginalUrl as jest.Mock).mockRejectedValue(error);

    await redirectUrl(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
