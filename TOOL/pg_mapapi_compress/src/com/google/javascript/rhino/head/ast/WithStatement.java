/* -*- Mode: java; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Rhino code, released
 * May 6, 1999.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1997-1999
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Steve Yegge
 *
 * Alternatively, the contents of this file may be used under the terms of
 * the GNU General Public License Version 2 or later (the "GPL"), in which
 * case the provisions of the GPL are applicable instead of those above. If
 * you wish to allow use of your version of this file only under the terms of
 * the GPL and not to allow others to use your version of this file under the
 * MPL, indicate your decision by deleting the provisions above and replacing
 * them with the notice and other provisions required by the GPL. If you do
 * not delete the provisions above, a recipient may use your version of this
 * file under either the MPL or the GPL.
 *
 * ***** END LICENSE BLOCK ***** */

package com.google.javascript.rhino.head.ast;

import com.google.javascript.rhino.head.Token;

/**
 * With statement.  Node type is {@link Token#WITH}.<p>
 *
 * <pre><i>WithStatement</i> :
 *      <b>with</b> ( Expression ) Statement ;</pre>
 */
public class WithStatement extends AstNode {

    private AstNode expression;
    private AstNode statement;
    private int lp = -1;
    private int rp = -1;

    {
        type = Token.WITH;
    }

    public WithStatement() {
    }

    public WithStatement(int pos) {
        super(pos);
    }

    public WithStatement(int pos, int len) {
        super(pos, len);
    }

    /**
     * Returns object expression
     */
    public AstNode getExpression() {
        return expression;
    }

    /**
     * Sets object expression (and its parent link)
     * @throws IllegalArgumentException} if expression is {@code null}
     */
    public void setExpression(AstNode expression) {
        assertNotNull(expression);
        this.expression = expression;
        expression.setParent(this);
    }

    /**
     * Returns the statement or block
     */
    public AstNode getStatement() {
        return statement;
    }

    /**
     * Sets the statement (and sets its parent link)
     * @throws IllegalArgumentException} if statement is {@code null}
     */
    public void setStatement(AstNode statement) {
        assertNotNull(statement);
        this.statement = statement;
        statement.setParent(this);
    }

    /**
     * Returns left paren offset
     */
    public int getLp() {
      return lp;
    }

    /**
     * Sets left paren offset
     */
    public void setLp(int lp) {
      this.lp = lp;
    }

    /**
     * Returns right paren offset
     */
    public int getRp() {
      return rp;
    }

    /**
     * Sets right paren offset
     */
    public void setRp(int rp) {
      this.rp = rp;
    }

    /**
     * Sets both paren positions
     */
    public void setParens(int lp, int rp) {
        this.lp = lp;
        this.rp = rp;
    }

    @Override
    public String toSource(int depth) {
        StringBuilder sb = new StringBuilder();
        sb.append(makeIndent(depth));
        sb.append("with (");
        sb.append(expression.toSource(0));
        sb.append(") ");
        sb.append(statement.toSource(depth+1));
        if (!(statement instanceof Block)) {
            sb.append(";\n");
        }
        return sb.toString();
    }

    /**
     * Visits this node, then the with-object, then the body statement.
     */
    @Override
    public void visit(NodeVisitor v) {
        if (v.visit(this)) {
            expression.visit(v);
            statement.visit(v);
        }
    }
}
