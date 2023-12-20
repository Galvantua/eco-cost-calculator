import protoRecipe from './recipes.json';

// TODO: Find better workaround to get proper typing
const recipesJson = protoRecipe;

export type Recipe = (typeof recipesJson)[number];
export type Profession = Recipe['professions'][number];
export type BaselineItem = Recipe['products'][number];
export type Product = BaselineItem & { name: string };
export type TagIngredient = BaselineItem & { name: null };
export type ItemIngredient = BaselineItem & { tag: null };
export type Ingredient = ItemIngredient | TagIngredient;

export const recipes = recipesFromJson(protoRecipe);

export function recipesFromJson(json: typeof protoRecipe) {
  return json.map((recipe) => {
    const mainProduct = getMainProduct(recipe.products);
    const byproduct = getByproduct(recipe.products);

    return { ...recipe, mainProduct, byproduct };
  });
}

export type RecipeWithMainProdAndByprod = ReturnType<
  typeof recipesFromJson
>[number];

export function getMainProduct(products: Product[]): Product {
  // Usual case. Only 1 product
  if (products.length === 1) return products[0];

  // "Waste" Byproduct that scales with inputs. E.g. smelting (slag) or concentrating (tailings), oil drilling (barrels)
  const hasScalingProduct = products.some((product) => !product.isConstant);
  if (hasScalingProduct)
    return products.find((product) => product.isConstant) as Product;

  // Return The product with the largest quantity (e.g. ore crushing)
  return [...products].sort((a, b) => b.quantity - a.quantity)[0];

  // Are there other cases?
}

export function getByproduct(products: Product[]): Product | undefined {
  // Usual case. Only 1 main product
  if (products.length === 1) return undefined;

  // "Waste" Byproduct that scales with inputs. E.g. smelting (slag) or concentrating (tailings), oil drilling (barrels)
  const scalingProduct = products.find((product) => !product.isConstant);
  if (scalingProduct) return scalingProduct;

  // Return The product with the smallest quantity (e.g. ore crushing)
  return [...products].sort((a, b) => a.quantity - b.quantity)[0];
}
