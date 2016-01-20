function vec2d (x, y) {
	if ( !(this instanceof vec2d) )
		return new vec2d(x, y);

	else {
		this.x = x;
		this.y = y;
	}
}

vec2d.prototype.add = function add () {

	var sum = new vec2d(this.x, this.y);

	for (vector in arguments) {
		if (arguments.hasOwnProperty(vector)) {
			vector = arguments[vector];

			if (vector instanceof vec2d) {
				sum.x += vector.x;
				sum.y += vector.y;
			}
		}
	}

	return sum;
};

vec2d.prototype.sub = function sub () {

	var sum = new vec2d(this.x, this.y);

	for (vector in arguments) {
		if (arguments.hasOwnProperty(vector)) {
			vector = arguments[vector];

			if (vector instanceof vec2d) {
				sum.x -= vector.x;
				sum.y -= vector.y;
			}
		}
	}

	return sum;
};

vec2d.prototype.div = function div () {

	var product = new vec2d(this.x, this.y);

	for (vector in arguments) {
		if (arguments.hasOwnProperty(vector)) {
			vector = arguments[vector];

			if (vector instanceof vec2d) {
				this.x /= vector.x;
				this.y /= vector.y;
			}
		}
	}

	return product;
};

vec2d.prototype.mul = function mul () {

	var product = new vec2d(this.x, this.y);

	for (vector in arguments) {
		if (arguments.hasOwnProperty(vector)) {
			vector = arguments[vector];

			if (vector instanceof vec2d) {
				product.x *= vector.x;
				product.y *= vector.y;
			}
		}
	}

	return product;
};
