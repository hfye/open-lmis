/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2013 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program.  If not, see http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

package org.openlmis.reporting.repository.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.openlmis.reporting.model.Template;
import org.openlmis.reporting.model.TemplateParameter;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * It maps the Template entity to corresponding representation in database.
 */

@Repository
public interface TemplateMapper {

  @Select("SELECT * FROM templates WHERE id = #{id}")
  Template getById(Long id);

  @Insert({"INSERT INTO templates (name, data, type, description, createdBy)",
    "VALUES (#{name}, #{data}, #{type}, #{description}, #{createdBy})"})
  @Options(useGeneratedKeys = true)
  void insert(Template template);

  @Select("SELECT id, name FROM templates WHERE type = 'Consistency Report' ORDER BY createdDate")
  List<Template> getAllConsistencyReportTemplates();

  @Select("SELECT * FROM templates WHERE LOWER(name) = LOWER(#{name})")
  Template getByName(String name);

  @Insert({"INSERT INTO template_parameters(templateId, name, displayName, defaultValue, dataType, description, createdBy)",
    "VALUES (#{templateId}, #{name}, #{displayName}, #{defaultValue}, #{dataType}, #{description}, #{createdBy})"})
  @Options(useGeneratedKeys = true)
  void insertParameter(TemplateParameter parameter);

  @Select({"SELECT t.id, t.name FROM templates t",
    "INNER JOIN report_rights rt ON rt.templateId = t.id",
    "INNER JOIN role_rights rr ON rr.rightName = rt.rightName",
    "INNER JOIN role_assignments ra ON ra.roleId = rr.roleId WHERE ra.userId = #{userId} ORDER BY LOWER(t.name)"})
  List<Template> getAllTemplatesForUser(@Param("userId") Long userId);
}