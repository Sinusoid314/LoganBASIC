const OBJ_TYPE_USER_FUNC = "Function";
const OBJ_TYPE_NATIVE_FUNC = "Native Function";
const OBJ_TYPE_ARRAY = "Array";
const OBJ_TYPE_STRUCT_DEF = "Structure Definition";
const OBJ_TYPE_STRUCT = "Structure Instance";

class ObjUserFunc
{
  constructor(ident, sourceName, sourceLevel, declSourceLineNum = 0)
  {
    this.type = OBJ_TYPE_USER_FUNC;
    this.ident = ident;
    this.paramCount = 0;
    this.localIdents = [];
    this.literals = [];
    this.ops = [];
    this.sourceLineMap = new Map();
    this.sourceName = sourceName;
    this.sourceLevel = sourceLevel;
    this.declSourceLineNum = declSourceLineNum; 
  }

  toString()
  //Return the function as a string
  {
    var retStr = "";

    retStr += "Name: " + this.ident + "\n";
    retStr += "Parameter #: " + this.paramCount + "\n\n";

    retStr += "Variables:\n------------\n";
    for(var varIndex = 0; varIndex < this.localIdents.length; varIndex++)
      retStr += varIndex + ":  " + this.localIdents[varIndex] + "\n";
    retStr += '\n';

    retStr += "Literals:\n-----------\n";
    for(var litIndex = 0; litIndex < this.literals.length; litIndex++)
      retStr += litIndex + ":  " + this.literals[litIndex] + "\n";
    retStr += '\n\n';

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

  getOpSourceLineNum(opIndex)
  //Return the source line number that corresponds to the given op index;
  //if the op index does not have an associated source line number, return 0
  {
    for(const [sourceLineNum, opIndexRange] of this.sourceLineMap)
    {
      if(opIndexRange.isInRange(opIndex))
        return sourceLineNum;
    }

    return 0;
  }
}

class ObjNativeFunc
{
  constructor(ident, paramMin, paramMax, jsFunc)
  {
    this.type = OBJ_TYPE_NATIVE_FUNC;
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
    this.type = OBJ_TYPE_ARRAY;
    this.items = [];
    this.dimSizes = [];
  }

  reDim(newDimSizeList)
  //Change the array dimensions
  {
    var newLinearSize = 1;

    if((newDimSizeList.length == 1) && (newDimSizeList[0] == 0))
      newLinearSize = 0;
    else
    {
      for(var n = 0; n < newDimSizeList.length; n++)
      {
        if(newDimSizeList[n] <= 0)
          return false;
        
        newLinearSize *= newDimSizeList[n];
      }
    }

    this.dimSizes = newDimSizeList;
    this.items = new Array(newLinearSize).fill(null);

    return true;
  }

  getLinearIndex(indexes)
  //Convert the given index list to a linear index
  {
    var linearIndex = 0;
    var multiplier = 1;

    if(indexes.length != this.dimSizes.length)
      return -1;

    for(var n = 0; n < this.dimSizes.length; n++)
    {
      if((indexes[n] < 0) || (indexes[n] >= this.dimSizes[n]))
        return -1;

      linearIndex += indexes[n] * multiplier;
      multiplier *= this.dimSizes[n];
    }

    return linearIndex;
  }

  getIndexes(linearIndex)
  //Convert the given linear index to an index list 
  {
    var indexes = [];
    var index, dividend;

    if(linearIndex >= this.items.length)
      return null;

    dividend = linearIndex;

    for(var n = 0; n < this.dimSizes.length; n++)
    {
      index = dividend % this.dimSizes[n];
      dividend = (dividend - index) / this.dimSizes[n];
      indexes.push(index);
    }

    return indexes;
  }

  addItem(newVal, beforeIndex = -1)
  //Add an item to the array
  {
    if(this.dimSizes.length != 1)
      return "Can only add items to a one-dimensional array.";

    if(beforeIndex == -1)
      beforeIndex = this.items.length;

    if((beforeIndex < 0) || (beforeIndex > this.items.length))
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

class ObjStructureDef
{
  constructor(ident)
  {
    this.type = OBJ_TYPE_STRUCT_DEF;
    this.ident = ident;
    this.fieldIdents = [];
  }

  toString()
  //Return the structure definition as a string
  {
    var retStr = "";

    retStr += "Name: " + this.ident + "\n";

    retStr += "Fields:\n------------\n";
    for(var fieldIndex = 0; fieldIndex < this.fieldIdents.length; fieldIndex++)
      retStr += fieldIndex + ":  " + this.fieldIdents[fieldIndex] + "\n";
    retStr += '\n';

    return retStr;
  }
}

class ObjStructure
{
  constructor(def)
  {
    this.type = OBJ_TYPE_STRUCT;
    this.def = def;
    this.fieldMap = new Map();

    for(var fieldIndex = 0; fieldIndex < def.fieldIdents.length; fieldIndex++)
      this.fieldMap.set(def.fieldIdents[fieldIndex], null);
  }
}
