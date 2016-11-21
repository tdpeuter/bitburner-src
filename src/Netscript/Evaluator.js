/* Evaluator
 * 	Evaluates the Abstract Syntax Tree for Netscript
 *  generated by the Parser class
 */
 
function evaluate(exp, env) {
    switch (exp.type) {
		case "num":
		case "str":
		case "bool":
			return exp.value;

		case "var":
			return env.get(exp.value);

		//Can currently only assign to "var"s
		case "assign":
			if (exp.left.type != "var")
				throw new Error("Cannot assign to " + JSON.stringify(exp.left));
			return env.set(exp.left.value, evaluate(exp.right, env));

		case "binary":
			return apply_op(exp.operator,
							evaluate(exp.left, env),
							evaluate(exp.right, env));


		case "if":
			var numConds = exp.cond.length;
			var numThens = exp.then.length;
			if (numConds == 0 || numThens == 0 || numConds != numThens) {
				throw new Error ("Number of conds and thens in if structure don't match (or there are none)");
			}
			
			for (var i = 0; i < numConds; i++) {
				var cond = evaluate(exp.cond[i], env);
				if (cond) return evaluate(exp.then, env);
			}
			
			//Evaluate else if it exists, snce none of the conditionals
			//were true
			return exp.else ? evaluate(exp.else, env) : false;
				
		case "for":
			evaluate(exp.init, env);
			cond = evaluate(exp.cond, env);
			console.log("Evaluated the conditional");
			while (cond) {
				evaluate(exp.code, env);
				evaluate(exp.postloop, env);
				cond = evaluate(exp.cond, env);
			}
		
			//TODO I don't think I need to return anything..but I might be wrong
			break;
		case "while":
			cond = evaluate(exp.cond, env);
			
			while (cond) {
				evaluate(exp.code, env);
				cond = evaluate(exp.cond, env);
			}

			//TODO I don't think I need to return anything..but I might be wrong
			break;
		case "prog":
			var val = false;
			exp.prog.forEach(function(exp){ val = evaluate(exp, env) });
			return val;

		/* Currently supported function calls:
		 * 		hack()
		 *		sleep(N) - sleep N seconds
		 *		print(x) - Prints a variable or constant
		 *
		 */
		case "call":
			//Define only valid function calls here, like hack() and stuff
			//var func = evaluate(exp.func, env);
			//return func.apply(null, exp.args.map(function(arg){
			//	return evaluate(arg, env);
			//}));
			if (exp.func.value == "hack") {
				console.log("Execute hack()");
			} else if (exp.func.value == "sleep") {
				console.log("Execute sleep()");
			} else if (exp.func.value == "print") {
                post(evaluate(exp.args[0], env).toString());
			}
			break;

		default:
			throw new Error("I don't know how to evaluate " + exp.type);
    }
}

function apply_op(op, a, b) {
    function num(x) {
        if (typeof x != "number")
            throw new Error("Expected number but got " + x);
        return x;
    }
    function div(x) {
        if (num(x) == 0)
            throw new Error("Divide by zero");
        return x;
    }
    switch (op) {
      case "+": return num(a) + num(b);
      case "-": return num(a) - num(b);
      case "*": return num(a) * num(b);
      case "/": return num(a) / div(b);
      case "%": return num(a) % div(b);
      case "&&": return a !== false && b;
      case "||": return a !== false ? a : b;
      case "<": return num(a) < num(b);
      case ">": return num(a) > num(b);
      case "<=": return num(a) <= num(b);
      case ">=": return num(a) >= num(b);
      case "==": return a === b;
      case "!=": return a !== b;
    }
    throw new Error("Can't apply operator " + op);
}