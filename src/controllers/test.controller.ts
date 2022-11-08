// import express, { Request, Response } from "express";
// import { cityIdCache } from "../database/cityIdCache";

// class TestController {
//     public path = "/test";
//     public router = express.Router();
//     constructor() {
//         this.router.get("/t", this.set);
//         this.router.get("/g", this.get);
//     }

//     public set(req: Request, res: Response) {
//         try {
//             const city = req.body.city;
//             const id = req.body.id;
//             cityIdCache.set(city, id);
//             console.log(cityIdCache, "17rm");
//             return res.status(200).json({ v: cityIdCache });
//         } catch (err) {
//             console.log(err);
//             return res.json({ msg: "err" });
//         }
//     }
//     public get(req: Request, res: Response) {
//         try {
//             const city = req.body.city;
//             return res.json({ v: cityIdCache.get(city) });
//         } catch (err) {
//             return res.json({ err: err });
//         }
//     }
// }

// export default TestController;
