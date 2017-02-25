"""
 # Copyright (c) 2017 Boolein Integer Indonesia, PT.
 # suryakencana 2/19/17 @author nanang.suryadi@boolein.id
 #
 # You are hereby granted a non-exclusive, worldwide, royalty-free license to
 # use, copy, modify, and distribute this software in source code or binary
 # form for use in connection with the web services and APIs provided by
 # Boolein.
 #
 # As with any software that integrates with the Boolein platform, your use
 # of this software is subject to the Boolein Developer Principles and
 # Policies [http://developers.Boolein.com/policy/]. This copyright notice
 # shall be included in all copies or substantial portions of the software.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 # THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 # FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 # DEALINGS IN THE SOFTWARE
 # 
 # user
"""
import logging
from baka import forms
import colander
from baka.i18n import translate as _

LOG = logging.getLogger(__name__)


@colander.deferred
def username_validator(node, kw):
    request = kw.get('request')

    def validator(_node, value):
        User = request.find_model('membership.user')
        user = User.get_by_username(request.db, value)
        if user and str(user.id) != request.params.get('id'):
            raise colander.Invalid(
                _node,
                _(u'User with the same username exists'),
            )
    return colander.All(colander.Length(max=32), validator,)


@colander.deferred
def email_validator(node, kw):
    request = kw.get('request')

    def validator(_node, value):
        User = request.find_model('membership.user')
        user = User.get_by_email(request.db, value)
        if user and str(user.id) != request.params.get('id'):
            raise colander.Invalid(
                _node,
                _(u'User with the same email exists'),
            )
    return colander.All(colander.Email(), validator,)


@colander.deferred
def employee_validator(node, kw):
    request = kw.get('request')

    def validator(_node, value):
        User = request.find_model('membership.user')
        user = User.by_employee_id(value)
        if user and str(user.id) != request.params.get('id'):
            raise colander.Invalid(
                _node,
                _(u'User for this employee already exists'),
            )
    return colander.All(validator,)


@colander.deferred
def password_validator(node, kw):
    request = kw.get('request')

    def validator(_node, value):
        if value and request.params.get('password_confirm') != value:
            raise colander.Invalid(
                _node,
                _(u'Password and confirm is not equal'),
            )
    return colander.All(colander.Length(min=6, max=128), validator,)


class _UserAddSchema(forms.CSRFSchema):
    username = colander.SchemaNode(
        colander.String(),
        validator=username_validator
    )
    email = colander.SchemaNode(
        colander.String(),
        validator=email_validator
    )
    password = colander.SchemaNode(
        colander.String(),
        validator=password_validator
    )
    status = colander.SchemaNode(
        colander.String(),
    )


class _UserEditSchema(_UserAddSchema):
    password = colander.SchemaNode(
        colander.String(),
        missing=None,
        validator=password_validator
    )
    password_confirm = colander.SchemaNode(
        colander.String(),
        missing=None
    )


class _UserForm(forms.BaseForm):

    def submit(self, user=None):
        if not user:
            user = self.request.find_model('membership.user')()

        LOG.debug(user)

        user.username = self._controls.get('username')
        user.email = self._controls.get('email')
        user.status = self._controls.get('status')
        if self._controls.get('password'):
            user.password = self._controls.get('password')
        return user


class UserAddForm(_UserForm):
    _schema = _UserAddSchema


class UserEditForm(_UserForm):
    _schema = _UserEditSchema