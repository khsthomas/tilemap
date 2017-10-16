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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * AST node for an Array literal.  The elements list will always be
 * non-{@code null}, although the list will have no elements if the Array literal
 * is empty.<p>
 *
 * Node type is {@link Token#ARRAYLIT}.<p>
 *
 * <pre><i>ArrayLiteral</i> :
 *        <b>[</b> Elisionopt <b>]</b>
 *        <b>[</b> ElementList <b>]</b>
 *        <b>[</b> ElementList , Elisionopt <b>]</b>
 * <i>ElementList</i> :
 *        Elisionopt AssignmentExpression
 *        ElementList , Elisionopt AssignmentExpression
 * <i>Elision</i> :
 *        <b>,</b>
 *        Elision <b>,</b></pre>
 */
public class ArrayLiteral extends AstNode implements DestructuringForm {

    private static final List<AstNode> NO_ELEMS =
        Collections.unmodifiableList(new ArrayList<AstNode>());

    private List<AstNode> elements;
    private int destructuringLength;
    private int skipCount;
    private boolean isDestructuring;

    {
        type = Token.ARRAYLIT;
    }

    public ArrayLiteral() {
    }

    public ArrayLiteral(int pos) {
        super(pos);
    }

    public ArrayLiteral(int pos, int len) {
        super(pos, len);
    }

    /**
     * Returns the element list
     * @return the element list.  If there are no elements, returns an immutable
     *         empty list.  Elisions are represented as {@link EmptyExpression}
     *         nodes.
     */
    public List<AstNode> getElements() {
        return elements != null ? elements : NO_ELEMS;
    }

    /**
     * Sets the element list, and sets each element's parent to this node.
     * @param elements the element list.  Can be {@code null}.
     */
    public void setElements(List<AstNode> elements) {
        if (elements == null) {
            this.elements = null;
        } else {
            if (this.elements != null)
                this.elements.clear();
            for (AstNode e : elements)
                addElement(e);
        }
    }

    /**
     * Adds an element to the list, and sets its parent to this node.
     * @param element the element to add
     * @throws IllegalArgumentException if element is {@code null}.  To indicate
     *         an empty element, use an {@link EmptyExpression} node.
     */
    public void addElement(AstNode element) {
        assertNotNull(element);
        if (elements == null)
            elements = new ArrayList<AstNode>();
        elements.add(element);
        element.setParent(this);
    }

    /**
     * Returns the number of elements in this {@code Array} literal,
     * including empty elements.
     */
    public int getSize() {
        return elements == null ? 0 : elements.size();
    }

    /**
     * Returns element at specified index.
     * @param index the index of the element to retrieve
     * @return the element
     * @throws IndexOutOfBoundsException if the index is invalid
     */
    public AstNode getElement(int index) {
        if (elements == null)
            throw new IndexOutOfBoundsException("no elements");
        return elements.get(index);
    }

    /**
     * Returns destructuring length
     */
    public int getDestructuringLength() {
      return destructuringLength;
    }

    /**
     * Sets destructuring length.  This is set by the parser and used
     * by the code generator.  {@code for ([a,] in obj)} is legal,
     * but {@code for ([a] in obj)} is not since we have both key and
     * value supplied.  The difference is only meaningful in array literals
     * used in destructuring-assignment contexts.
     */
    public void setDestructuringLength(int destructuringLength) {
      this.destructuringLength = destructuringLength;
    }

    /**
     * Used by code generator.
     * @return the number of empty elements
     */
    public int getSkipCount() {
        return skipCount;
    }

    /**
     * Used by code generator.
     * @param count the count of empty elements
     */
    public void setSkipCount(int count) {
        skipCount = count;
    }

    /**
     * Marks this node as being a destructuring form - that is, appearing
     * in a context such as {@code for ([a, b] in ...)} where it's the
     * target of a destructuring assignment.
     */
    public void setIsDestructuring(boolean destructuring) {
        isDestructuring = destructuring;
    }

    /**
     * Returns true if this node is in a destructuring position:
     * a function parameter, the target of a variable initializer, the
     * iterator of a for..in loop, etc.
     */
    public boolean isDestructuring() {
        return isDestructuring;
    }

    @Override
    public String toSource(int depth) {
        StringBuilder sb = new StringBuilder();
        sb.append(makeIndent(depth));
        sb.append("[");
        if (elements != null) {
            printList(elements, sb);
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Visits this node, then visits its element expressions in order.
     * Any empty elements are represented by {@link EmptyExpression}
     * objects, so the callback will never be passed {@code null}.
     */
    @Override
    public void visit(NodeVisitor v) {
        if (v.visit(this)) {
            for (AstNode e : getElements()) {
                e.visit(v);
            }
        }
    }
}
