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
 # models
"""
import datetime
import logging

from . import helper
from baka._compat import text_type
from baka_model.model import Model
from baka_model.model.meta.type import EnumIntType
from cryptacular import bcrypt
import sqlalchemy as sa
from baka.i18n import translate as _
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.ext.hybrid import hybrid_property

log = logging.getLogger(__name__)


class Activation(Model):

    """
    Handles activations for users.

    The code should be a random hash that is valid only once.
    After the hash is used to access the site, it'll be removed.
    """

    __tablename__ = 'membership.activation'

    # A random hash that is valid only once.
    code = sa.Column(sa.UnicodeText(),
                     nullable=False,
                     unique=True,
                     default=helper.generate_random_string)

    @classmethod
    def get_by_code(cls, session, code):
        """Fetch an activation by code."""
        return session.query(cls).filter(cls.code == code).first()


class Token(Model):

    """A long-lived API Token for a user."""

    __tablename__ = u'membership.token'

    #: A prefix that identifies a token as a long-lived API token (as opposed
    #: to, for example, one of the short-lived JWTs that the client uses).
    prefix = u'6879-'

    uid = sa.Column(sa.UnicodeText(),
                    nullable=False,
                    unique=True)

    value = sa.Column(sa.UnicodeText(),
                      nullable=False,
                      unique=True)

    def __init__(self, uid):
        self.uid = uid
        self.regenerate()

    @classmethod
    def get_by_userid(cls, session, uid):
        return session.query(cls).filter(cls.userid == uid).first()

    @classmethod
    def get_by_value(cls, session, value):
        return session.query(cls).filter(cls.value == value).first()

    def regenerate(self):
        self.value = u''.join([self.prefix, helper.generate_random_string(16)])


CRYPT = bcrypt.BCRYPTPasswordManager()
USERNAME_MIN_LENGTH = 3
USERNAME_MAX_LENGTH = 30
EMAIL_MAX_LENGTH = 100
PASSWORD_MIN_LENGTH = 2


class User(Model):

    __tablename__ = u'membership.user'

    STATUS = (
        ('employee', _(u'Employee')),
        ('student', _(u'Student')),
        ('member', _(u'Member'))
    )

    # Normalised user identifier
    uid = sa.Column(sa.UnicodeText(), nullable=False, unique=True)

    # Username as chosen by the user on registration
    _username = sa.Column('username',
                          sa.UnicodeText(),
                          nullable=False,
                          unique=True)

    # Is this user a admin?
    admin = sa.Column(sa.Boolean,
                      default=False,
                      nullable=False,
                      server_default=sa.sql.expression.false())

    status = sa.Column(
        EnumIntType(STATUS),
        default='employee',
        nullable=False,
    )

    def _get_username(self):
        return self._username

    def _set_username(self, value):
        if not USERNAME_MIN_LENGTH <= len(value) <= USERNAME_MAX_LENGTH:
            raise ValueError(
                'username must be between {min} and {max} '
                'characters long'.format(
                    min=USERNAME_MIN_LENGTH,
                    max=USERNAME_MAX_LENGTH))
        self._username = value
        self.uid = _username_to_uid(value)

    @declared_attr
    def username(self):
        return sa.orm.synonym('_username',
                              descriptor=property(self._get_username,
                                                  self._set_username))

    email = sa.Column(sa.UnicodeText(), nullable=False, unique=True)

    last_login_date = sa.Column(sa.TIMESTAMP(timezone=False),
                                default=datetime.datetime.utcnow,
                                server_default=sa.func.now(),
                                nullable=False)
    registered_date = sa.Column(sa.TIMESTAMP(timezone=False),
                                default=datetime.datetime.utcnow,
                                server_default=sa.func.now(),
                                nullable=False)

    # Activation foreign key
    activation_id = sa.Column(sa.Integer, sa.ForeignKey(Activation.id))
    activation = sa.orm.relationship('Activation', backref='user')

    @sa.orm.validates('email')
    def validate_email(self, key, email):
        if len(email) > EMAIL_MAX_LENGTH:
            raise ValueError('email must be less than {max} characters '
                             'long'.format(max=EMAIL_MAX_LENGTH))
        return email

    @property
    def is_activated(self):
        if self.activation_id is None:
            return True

        return False

    def activate(self):
        """Activate the user by deleting any activation they have."""
        session = sa.orm.object_session(self)
        session.delete(self.activation)

    # Hashed password
    _password = sa.Column('password', sa.UnicodeText(), nullable=False)
    # Password salt
    salt = sa.Column(sa.UnicodeText(), nullable=False)
    # Last password update
    password_updated = sa.Column(sa.DateTime(),
                                 default=datetime.datetime.utcnow,
                                 server_default=sa.func.now(),
                                 nullable=False)

    @hybrid_property
    def password(self):
        return self._password

    @password.setter
    def password(self, value):
        self._set_password(value)

    def _get_password(self):
        return self._password

    def _set_password(self, raw_password):
        if len(raw_password) < PASSWORD_MIN_LENGTH:
            raise ValueError('password must be more than {min} characters '
                             'long'.format(min=PASSWORD_MIN_LENGTH))
        self._password = self._hash_password(raw_password)
        self.password_updated = datetime.datetime.utcnow()

    def _hash_password(self, password):
        if not self.salt:
            self.salt = helper.generate_random_string(24)

        return text_type(CRYPT.encode(password + self.salt))

    @classmethod
    def get_by_email(cls, session, email):
        """Fetch a user by email address."""
        return session.query(cls).filter(
            sa.func.lower(cls.email) == email.lower()
        ).first()

    @classmethod
    def get_by_activation(cls, session, activation):
        """Fetch a user by activation instance."""
        user = session.query(cls).filter(
            cls.activation_id == activation.id
        ).first()

        return user

    @classmethod
    def validate_user(cls, user, password):
        """Validate the passed password for the specified user."""
        if not user:
            return None

        if user.password is None:
            valid = False
        else:
            valid = CRYPT.check(user.password, password + user.salt)

        return valid

    @classmethod
    def get_by_username(cls, session, username):
        """Fetch a user by username."""
        log.debug(username)
        uid = _username_to_uid(username)
        return session.query(cls).filter(cls.uid == uid).first()

    def __repr__(self):
        return '<User: %s>' % self.username


def _username_to_uid(username):
    # We normalize usernames by dots and case in order to discourage attempts
    # at impersonation.
    return username.replace('.', '').lower()


def includeme(config):
    config.register_model(__name__)
