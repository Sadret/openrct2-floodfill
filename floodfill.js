function flood(element, price, sh, x, y) {
	fill(element, price, sh, x - 1, y);
	fill(element, price, sh, x + 1, y);
	fill(element, price, sh, x, y - 1);
	fill(element, price, sh, x, y + 1);
}

function fill(element, price, sh, x, y) {
	if (x < 0 || y < 0 || x >= map.size.x || y >= map.size.y)
		return;
	if (park.cash < price)
		return;
	var tile = map.getTile(x, y);
	var surface = getSurface(tile);
	if (!surface.hasOwnership || surface.baseHeight != sh || surface.slope !== 0)
		return;
	var e = insertTileElement(tile, element.baseHeight, element.clearanceHeight);
	if (e === undefined)
		return;
	e.type = element.type;
	e.object = element.object;
	e.direction = element.direction;
	park.cash -= price;
	flood(element, price, sh, x, y);
}

function insertTileElement(tile, baseHeight, clearanceHeight) {
	var index = findPlacementPosition(tile, baseHeight, clearanceHeight);
	if (index === undefined)
		return undefined;
	var element = tile.insertElement(index);
	element.baseHeight = baseHeight;
	element.clearanceHeight = clearanceHeight;
	return element;
};

function findPlacementPosition(tile, baseHeight, clearanceHeight) {
	for (var index = 0; index < tile.numElements; index++) {
		var element = tile.getElement(index);
		if (element.baseHeight >= clearanceHeight)
			return index;
		if (element.clearanceHeight > baseHeight)
			return undefined;
	}
	return tile.numElements;
};

function getSurface(tile) {
	for (var index = 0; index < tile.numElements; index++)
		if (tile.elements[index].type === "surface")
			return tile.elements[index];
}


registerPlugin({
	name: 'floodfill',
	version: '1.0',
	authors: ['Sadret'],
	type: 'local',
	licence: 'MIT',
	main: function() {
		ui.registerMenuItem("floodfill tool", function() {
			ui.activateTool({
				id: "floodfill",
				cursor: "cross_hair",
				onMove: function(e) {
					var xyz = e.mapCoords;
					ui.tileSelection.range = {
						leftTop: {
							x: xyz.x,
							y: xyz.y,
						},
						rightBottom: {
							x: xyz.x,
							y: xyz.y,
						}
					};
				},
				onUp: function(e) {
					var xyz = e.mapCoords;
					var idx = e.tileElementIndex;

					if (xyz === undefined && idx === undefined) {
						console.log("xyz or tileElementIndex undefined");
						ui.tool.cancel();
						return;
					}

					var tile = map.getTile(xyz.x / 32, xyz.y / 32);
					var element = tile.elements[idx];
					var surface = getSurface(tile);
					var object = context.getObject("small_scenery", element.object);

					if (element.type !== "small_scenery")
						return;

					flood(element, object.price * 10, surface.baseHeight, tile.x, tile.y);

					ui.tool.cancel();
					return;
				},
			});
		});
	},
});