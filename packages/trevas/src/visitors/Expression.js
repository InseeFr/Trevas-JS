import { VtlVisitor, VtlParser } from '@inseefr/vtl-2.0-antlr-tools';
import ArithmeticVisitor from './Arithmetic';
import BooleanVisitor from './Boolean';
import IfThenElse from './Conditional';
import VariableVisitor from './Variable';
import LiteralVisitor from './Literal';
import ComparisonVisitor from './Comparison';
import InNotInVisitor from './InNotInVisitor';
import {
	CastVisitor,
	ComparisonFunctionVisitor,
	ConcatenationVisitor,
	NumericFunctionsVisitor,
	StringFunctionsVisitor,
	DatasetFunctionsVisitor,
	DateVisitor,
} from './functions';

class ExpressionVisitor extends VtlVisitor {
	constructor(bindings) {
		super();
		this.bindings = bindings;
		this.arithmeticVisitor = new ArithmeticVisitor(this);
		this.booleanAlgebraVisitor = new BooleanVisitor(this);
		this.castFunctionVisitor = new CastVisitor(this);
		this.comparisonVisitor = new ComparisonVisitor(this);
		this.concatenationVisitor = new ConcatenationVisitor(this);
		this.dateFunctionVisitor = new DateVisitor(this);
		this.ifThenElseVisitor = new IfThenElse(this);
		this.literalVisitor = new LiteralVisitor();
		this.comparisonFunctionVisitor = new ComparisonFunctionVisitor(this);
		this.numericFunctionsVisitor = new NumericFunctionsVisitor(this);
		this.stringFunctionVisitor = new StringFunctionsVisitor(this);
		this.variableVisitor = new VariableVisitor(this.bindings);
		this.inNotInVisitor = new InNotInVisitor(this);
		this.datasetFunctionsVisitor = new DatasetFunctionsVisitor(this);
	}

	visitComparisonExpr = (ctx) => this.comparisonVisitor.visit(ctx);

	// Since the grammar groups the binary expression we need to "route" to our
	// own visitor groups.
	visitArithmeticExpr = (ctx) => this.arithmeticVisitor.visit(ctx);

	visitArithmeticExprOrConcat = (ctx) => {
		const { op } = ctx;
		if (op.type === VtlParser.CONCAT)
			return new ConcatenationVisitor(this).visit(ctx);
		return this.arithmeticVisitor.visit(ctx);
	};

	visitUnaryExpr = (ctx) => {
		const { op } = ctx;
		if (op.type === VtlParser.NOT) return this.booleanAlgebraVisitor.visit(ctx);
		return this.arithmeticVisitor.visit(ctx);
	};

	visitBooleanExpr = (ctx) => this.booleanAlgebraVisitor.visit(ctx);

	visitParenthesisExpr = (ctx) => this.visit(ctx.expr());

	visitIfExpr = (ctx) => this.ifThenElseVisitor.visit(ctx);

	visitConditionalFunctions = (ctx) => this.visit(ctx.conditionalOperators());

	visitNvlAtom = (ctx) => this.ifThenElseVisitor.visit(ctx);

	// TODO: Optional expression should handle missing values.
	visitOptionalExpr = (ctx) =>
		ctx.expr() === null ? null : this.visit(ctx.expr());

	visitFunctionsExpression = (ctx) => this.visit(ctx.functions());

	visitGenericFunctions = (ctx) => this.visit(ctx.genericOperators());

	visitTimeFunctions = (ctx) => this.visit(ctx.timeOperators());

	visitVarIdExpr = (ctx) => this.variableVisitor.visit(ctx);

	visitConstant = (ctx) => this.literalVisitor.visit(ctx);

	visitConstantExpr = (ctx) => this.literalVisitor.visit(ctx);

	visitInNotInExpr = (ctx) => this.inNotInVisitor.visit(ctx);

	// Functions
	visitCastExprDataset = (ctx) => this.castFunctionVisitor.visit(ctx);

	visitCurrentDateAtom = (ctx) => this.dateFunctionVisitor.visit(ctx);

	visitConcatExpr = (ctx) => this.concatenationVisitor.visit(ctx);

	visitStringFunctions = (ctx) =>
		this.stringFunctionVisitor.visit(ctx.stringOperators());

	visitComparisonFunctions = (ctx) =>
		this.comparisonFunctionVisitor.visit(ctx.comparisonOperators());

	visitNumericFunctions = (ctx) =>
		this.numericFunctionsVisitor.visit(ctx.numericOperators());

	visitAggregateFunctions = (ctx) =>
		this.datasetFunctionsVisitor.visit(ctx.aggrOperatorsGrouping());

	visitAnalyticFunctions = (ctx) =>
		this.datasetFunctionsVisitor.visit(ctx.anFunction());
}

export default ExpressionVisitor;
