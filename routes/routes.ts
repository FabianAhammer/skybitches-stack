export function setupRoutes(app: ) {
	
    app.post("/login", (req: any, res: any) => {

    });

	app.post("/createuser", (req: any, res: any) => {
		res.send(req.body);
	});
}
