class ObjUserFunc
{
  constructor(ident)
  {
    this.ident = ident;
    this.paramCount = 0;
    this.varIdents = [];
    this.ops = [];
    this.tokens = [];
    this.sourceLineMap = new Map();
  }

  toString()
  //Return the function as a string
  {
    var retStr = "";

    retStr += "Name: " + this.ident + "\n";
    retStr += "Parameter #: " + this.paramCount + "\n\n";

    retStr += "Variables:\n------------\n";
    for(var varIndex = 0; varIndex < this.varIdents.length; varIndex++)
      retStr += varIndex + ":  " + this.varIdents[varIndex] + "\n";
    retStr += '\n';

    retStr += "Ops:\n------\n";
    for(var opIndex = 0; opIndex < this.ops.length; opIndex++)
    {
      retStr += opIndex + ":  " + opNames[this.ops[opIndex][0]];
      for(var operandIndex = 1; operandIndex < this.ops[opIndex].length; operandIndex++)
        retStr += ", " + this.ops[opIndex][operandIndex];
      retStr += '\n';
    }
    retStr += '\n';

    return retStr;
  }
}

class ObjNativeFunc
{
  constructor(ident, paramMin, paramMax, jsFunc)
  {
    this.ident = ident;
    this.paramMin = paramMin;
    this.paramMax = paramMax;
    this.jsFunc = jsFunc;
  }
}

class ObjArray
{
  constructor()
  {
    this.items = [];
    this.dimSizes = [];
  }

  reDim(newDimSizeList)
  //Change the array dimensions
  {
    var newLinearSize = 1;

    for(var n = 0; n < newDimSizeList.length; n++)
    {
      if(newDimSizeList[n] <= 0)
        return false;

      newLinearSize *= newDimSizeList[n];
    }

    this.dimSizes = newDimSizeList;
    this.items = new Array(newLinearSize).fill(0);

    return true;
  }

  getLinearIndex(indexList)
  //Convert the given index list to a linear index
  {
    var linearIndex = 0;
    var multiplier = 1;

    if(indexList.length != this.dimSizes.length)
      return -1;

    for(var n = 0; n < this.dimSizes.length; n++)
    {
      if((indexList[n] < 0) || (indexList[n] >= this.dimSizes[n]))
        return -1;

      linearIndex += indexList[n] * multiplier;
      multiplier *= this.dimSizes[n];
    }

    return linearIndex;
  }

  addItem(newVal, beforeIndex)
  //Add an item to the array
  {
    if(this.dimSizes.length != 1)
      return "Can only add items to a one-dimensional array.";

    if(beforeIndex == -1)
      beforeIndex = this.items.length - 1;

    if((beforeIndex < 0) || (beforeIndex >= this.items.length))
      return "Array index '" + beforeIndex + "' out of bounds.";

    this.items.splice(beforeIndex, 0, newVal);
    this.dimSizes[0]++;

    return "";
  }

  removeItem(itemIndex)
  //Remove an item from the array
  {
    if(this.dimSizes.length != 1)
      return "Can only remove items from a one-dimensional array.";

    if((itemIndex < 0) || (itemIndex >= this.items.length))
      return "Array index '" + itemIndex + "' out of bounds.";

    this.items.splice(itemIndex, 1);
    this.dimSizes[0]--;

    return "";
  }
}

class ObjStructure
{
  constructor(def)
  {
    this.def = def;
    this.fieldMap = new Map();

    for(var fieldIndex = 0; fieldIndex < def.fieldIdents.length; fieldIndex++)
      this.fieldMap.set(def.fieldIdents[fieldIndex], 0);
  }
}
