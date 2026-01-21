/* eslint-disable */
/**
 * Generated data model types - DO NOT EDIT
 * Run `npx convex dev` or `npx convex codegen` to regenerate
 */

import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  ExpressionOrValue,
  FilterBuilder,
  GenericDataModel,
  GenericDatabaseReader,
  GenericDatabaseWriter,
  GenericTableInfo,
  IndexNames,
  NamedIndex,
  NamedSearchIndex,
  NamedTableInfo,
  Query,
  QueryInitializer,
  SearchFilter,
  SearchFilterBuilder,
  SearchIndexNames,
  TableNamesInDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export type Doc<TableName extends TableNamesInDataModel<DataModel>> =
  DocumentByName<DataModel, TableName>;

export type Id<TableName extends TableNamesInDataModel<DataModel>> = GenericId<TableName>;
