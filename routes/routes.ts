export function setupRoutes(app: Express): void {
	app.post("/login", (req: any, res: any) => {});

	app.post("/createuser", (req: any, res: any) => {
		res.send(req.body);
	});
}
